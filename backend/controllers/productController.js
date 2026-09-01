const Product = require("../models/Product");
const { deleteImageFromCloudinary } = require("../config/cloudinary");

// @desc    Upload product images to Cloudinary (returns uploaded image payload)
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadImages = (req, res) => {
    res.status(200).json({
        success: true,
        images: req.uploadedImages || []
    });
};

// @desc    Create a new product 
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const {
            name, 
            description,
            price, 
            discountPrice, 
            countInStock, 
            category, 
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        if (price !== undefined && (typeof price !== "number" || price < 0)) {
            return res.status(400).json({ success: false, message: "Price must be a positive number" });
        }

        const product = new Product({
            name, 
            description,
            price, 
            discountPrice, 
            countInStock, 
            category, 
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json({ success: true, product: createdProduct });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing product by ID
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const {
            name, 
            description,
            price, 
            discountPrice, 
            countInStock, 
            category, 
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (price !== undefined && (typeof price !== "number" || price < 0)) {
            return res.status(400).json({ success: false, message: "Price must be a positive number" });
        }

        // Clean up old images removed in edit
        if (images && Array.isArray(images)) {
            const newPublicIds = new Set(images.map(img => img.publicId).filter(Boolean));
            for (const oldImg of product.images) {
                if (oldImg.publicId && !newPublicIds.has(oldImg.publicId)) {
                    await deleteImageFromCloudinary(oldImg.publicId);
                }
            }
        }

        product.name = name !== undefined ? name : product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price !== undefined ? price : product.price;
        product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
        product.category = category !== undefined ? category : product.category;
        product.brand = brand !== undefined ? brand : product.brand;
        product.sizes = sizes !== undefined ? sizes : product.sizes;
        product.colors = colors !== undefined ? colors : product.colors;
        product.collections = collections !== undefined ? collections : product.collections;
        product.material = material !== undefined ? material : product.material;
        product.gender = gender !== undefined ? gender : product.gender;
        product.images = images !== undefined ? images : product.images;
        product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
        product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
        product.tags = tags !== undefined ? tags : product.tags;
        product.dimensions = dimensions !== undefined ? dimensions : product.dimensions;
        product.weight = weight !== undefined ? weight : product.weight;
        product.sku = sku !== undefined ? sku : product.sku;

        const updatedProduct = await product.save();
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product by ID & remove its Cloudinary assets
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Clean up product images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                if (img.publicId) {
                    await deleteImageFromCloudinary(img.publicId);
                }
            }
        }

        await product.deleteOne();
        res.json({ success: true, message: "Product removed successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get the filter values that actually exist in the current catalog/collection
// @route   GET /api/products/filter-options
// @access  Public
const getProductFilterOptions = async (req, res, next) => {
    try {
        const { collection } = req.query;
        const query = {};

        if (collection && collection.toLowerCase() !== "all") {
            const isMen = collection.toLowerCase() === "men";
            const isWomen = collection.toLowerCase() === "women";
            
            const orConditions = [
                { collections: { $regex: `^${collection}$`, $options: "i" } },
                { category: { $regex: `^${collection}$`, $options: "i" } }
            ];
            
            if (isMen) {
                orConditions.push({ gender: { $in: ["Men", "Unisex"] } });
            } else if (isWomen) {
                orConditions.push({ gender: { $in: ["Women", "Unisex"] } });
            } else {
                orConditions.push({ gender: { $regex: `^${collection}$`, $options: "i" } });
            }
            
            query.$or = orConditions;
        }

        const products = await Product.find(query)
            .select("category gender sizes colors material brand price")
            .lean();

        const uniqueValues = (values) => {
            const seen = new Set();
            return values
                .map((value) => String(value || "").trim())
                .filter((value) => {
                    if (!value || seen.has(value.toLowerCase())) return false;
                    seen.add(value.toLowerCase());
                    return true;
                })
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        };

        const prices = products.map((product) => product.price).filter(Number.isFinite);

        const categoryCounts = {};
        const genderCounts = {};
        const colorCounts = {};
        const sizeCounts = {};
        const materialCounts = {};
        const brandCounts = {};

        products.forEach((p) => {
            const cat = String(p.category || "").trim();
            if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

            const gen = String(p.gender || "").trim();
            if (gen) genderCounts[gen] = (genderCounts[gen] || 0) + 1;

            const mat = String(p.material || "").trim();
            if (mat) materialCounts[mat] = (materialCounts[mat] || 0) + 1;

            const brd = String(p.brand || "").trim();
            if (brd) brandCounts[brd] = (brandCounts[brd] || 0) + 1;

            if (Array.isArray(p.colors)) {
                p.colors.forEach((c) => {
                    const col = String(c || "").trim();
                    if (col) colorCounts[col] = (colorCounts[col] || 0) + 1;
                });
            }

            if (Array.isArray(p.sizes)) {
                p.sizes.forEach((s) => {
                    const sz = String(s || "").trim();
                    if (sz) sizeCounts[sz] = (sizeCounts[sz] || 0) + 1;
                });
            }
        });

        res.json({
            success: true,
            options: {
                categories: uniqueValues(products.map((product) => product.category)),
                genders: uniqueValues(products.map((product) => product.gender)),
                colors: uniqueValues(products.flatMap((product) => product.colors || [])),
                sizes: uniqueValues(products.flatMap((product) => product.sizes || [])),
                materials: uniqueValues(products.map((product) => product.material)),
                brands: uniqueValues(products.map((product) => product.brand)),
                priceRange: {
                    min: prices.length ? Math.min(...prices) : 0,
                    max: prices.length ? Math.max(...prices) : 0
                },
                counts: {
                    categories: categoryCounts,
                    genders: genderCounts,
                    colors: colorCounts,
                    sizes: sizeCounts,
                    materials: materialCounts,
                    brands: brandCounts
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/id/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product review with optional Cloudinary images
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
    try {
        const { rating, comment, images } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: "You have already submitted a review for this item" });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            images: images || []
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ success: true, message: "Review submitted successfully", product });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all products with server-side pagination, query filtering, search, and sorting
// @route   GET /api/products
// @access  Public 
const getProducts = async (req, res, next) => {
    try {
        const {
            collection, 
            size, 
            color, 
            gender, 
            minPrice, 
            maxPrice, 
            sortBy,
            search, 
            category, 
            material, 
            brand, 
            limit,
            page
        } = req.query;

        let query = {};
        let conditions = []; // Array to hold multiple filter conditions safely

        // Flexible Filter logic for collections and genders
        if (collection && collection.toLowerCase() !== "all") {
            const isMen = collection.toLowerCase() === "men";
            const isWomen = collection.toLowerCase() === "women";
            
            const orConditions = [
                { collections: { $regex: `^${collection}$`, $options: "i" } },
                { category: { $regex: `^${collection}$`, $options: "i" } }
            ];
            
            if (isMen) {
                orConditions.push({ gender: { $in: ["Men", "Unisex"] } });
            } else if (isWomen) {
                orConditions.push({ gender: { $in: ["Women", "Unisex"] } });
            } else {
                orConditions.push({ gender: { $regex: `^${collection}$`, $options: "i" } });
            }
            
            conditions.push({ $or: orConditions });
        }

        if (category && category.toLowerCase() !== "all") {
            query.category = { $regex: category, $options: "i" };
        }

        if (material) {
            const matRegexes = material.split(",").map(m => new RegExp(m.trim(), "i"));
            query.material = { $in: matRegexes };
        }

        if (brand) {
            const brandRegexes = brand.split(",").map(b => new RegExp(b.trim(), "i"));
            query.brand = { $in: brandRegexes };
        }

        if (size) {
            query.sizes = { $in: size.split(",").map(s => s.trim()) };
        }

        if (color) {
            const colorRegexes = color.split(",").map(c => new RegExp(c.trim(), "i"));
            query.colors = { $in: colorRegexes };
        }

        if (gender && gender.toLowerCase() !== "all") {
            query.gender = { $regex: `^${gender}$`, $options: "i" };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice && Number(maxPrice) > 0) query.price.$lte = Number(maxPrice);
        }

        // Smart Search Logic: Strips common filler words and searches meaningful keywords
        if (search) {
            const stopWords = ["for", "and", "the", "a", "an", "in", "on", "with"];
            const searchWords = search
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(word => !stopWords.includes(word))
                .map(word => ({
                    $or: [
                        { name: { $regex: word, $options: "i" } },
                        { description: { $regex: word, $options: "i" } },
                        { category: { $regex: word, $options: "i" } },
                        { brand: { $regex: word, $options: "i" } },
                        { gender: { $regex: word, $options: "i" } }
                    ]
                }));

            if (searchWords.length > 0) {
                conditions.push({ $and: searchWords });
            }
        }

        // Combine all query conditions securely using $and if any exist
        if (conditions.length > 0) {
            query.$and = conditions;
        }

        // Sort Logic
        let sortQuery = { createdAt: -1 }; // default newest
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sortQuery = { price: 1 };
                    break;
                case "priceDesc":
                    sortQuery = { price: -1 };
                    break;
                case "popularity":
                    sortQuery = { rating: -1 };
                    break;
                case "newest":
                default:
                    sortQuery = { createdAt: -1 };
                    break;
            }
        }

        // Pagination Logic (defaults to page=1, limit=12 unless limit explicitly set to 0/all)
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const limitNumber = limit !== undefined ? parseInt(limit, 10) : 12;

        const totalProducts = await Product.countDocuments(query);
        
        let productsQuery = Product.find(query).sort(sortQuery);

        if (limitNumber > 0) {
            const skip = (pageNumber - 1) * limitNumber;
            productsQuery = productsQuery.skip(skip).limit(limitNumber);
        }

        const products = await productsQuery;
        const totalPages = limitNumber > 0 ? Math.ceil(totalProducts / limitNumber) : 1;

        res.json({
            success: true,
            count: products.length,
            totalProducts,
            totalPages,
            currentPage: pageNumber,
            limit: limitNumber,
            products,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImages,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductFilterOptions,
    getProductById,
    createProductReview,
    getProducts,
};
