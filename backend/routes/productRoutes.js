const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

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
// @desc    Delete a product by ID
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
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

// @route   GET /api/products
// @desc    Get all products with optional query filtering, stop-word stripped search, and sorting
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
            limit 
        } = req.query;

        let query = {};
        let conditions = []; // Array to hold multiple filter conditions safely

        // Flexible Filter logic for collections and genders
        if (collection && collection.toLowerCase() !== "all") {
            conditions.push({
                $or: [
                    { collections: collection },
                    { gender: collection },
                    { category: collection }
                ]
            });
        }

        if (category && category.toLowerCase() !== "all") {
            query.category = category;
        }

        if (material) {
            query.material = { $in: material.split(",") };
        }

        if (brand) {
            query.brand = { $in: brand.split(",") };
        }

        if (size) {
            query.sizes = { $in: size.split(",") };
        }

        if (color) {
            query.colors = { $in: [color] };
        }

        if (gender) {
            query.gender = gender;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
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

        const queryLimit = limit ? parseInt(limit, 10) : 0;

        const products = await Product.find(query)
            .sort(sortQuery)
            .limit(queryLimit);

        res.json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;