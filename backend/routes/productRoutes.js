const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const { deleteImageFromCloudinary } = require("../config/cloudinary");

const router = express.Router();

// @route   POST /api/products/upload
// @desc    Upload product images to Cloudinary
// @access  Private/Admin
router.post("/upload", protect, admin, uploadProductImages, (req, res) => {
    res.status(200).json({
        success: true,
        images: req.uploadedImages || []
    });
});

// @route   POST /api/products
// @desc    Create a new product 
// @access  Private/Admin
router.post("/", protect, admin, async (req, res, next) => {
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
});

// @route   PUT /api/products/:id
// @desc    Update an existing product by ID
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res, next) => {
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
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID & remove its Cloudinary assets
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
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
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get("/id/:id", async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.json({ success: true, product });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a new product review with optional Cloudinary images
// @access  Private
router.post("/:id/reviews", protect, async (req, res, next) => {
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
});


// @route   GET /api/products
// @desc    Get all products with server-side pagination, query filtering, search, and sorting
// @access  Public 
router.get("/", async (req, res, next) => {
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
            conditions.push({
                $or: [
                    { collections: { $regex: collection, $options: "i" } },
                    { gender: { $regex: collection, $options: "i" } },
                    { category: { $regex: collection, $options: "i" } }
                ]
            });
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
            query.gender = { $regex: gender, $options: "i" };
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
});

module.exports = router;