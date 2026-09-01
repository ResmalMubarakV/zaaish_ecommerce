const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/uploadMiddleware");
const {
    uploadImages,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductFilterOptions,
    getProductById,
    createProductReview,
    getProducts,
} = require("../controllers/productController");

const router = express.Router();

// @route   POST /api/products/upload
// @desc    Upload product images to Cloudinary
// @access  Private/Admin
router.post("/upload", protect, admin, uploadProductImages, uploadImages);

// @route   GET /api/products/filter-options
// @desc    Get the filter values that actually exist in the current catalog/collection
// @access  Public
router.get("/filter-options", getProductFilterOptions);

// @route   GET /api/products/id/:id
// @desc    Get single product by ID
// @access  Public
router.get("/id/:id", getProductById);

// @route   POST /api/products/:id/reviews
// @desc    Create a new product review with optional Cloudinary images
// @access  Private
router.post("/:id/reviews", protect, createProductReview);

// @route   GET /api/products
// @desc    Get all products with server-side pagination, query filtering, search, and sorting
// @access  Public 
router.get("/", getProducts);

// @route   POST /api/products
// @desc    Create a new product 
// @access  Private/Admin
router.post("/", protect, admin, createProduct);

// @route   PUT /api/products/:id
// @desc    Update an existing product by ID
// @access  Private/Admin
router.put("/:id", protect, admin, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID & remove its Cloudinary assets
// @access  Private/Admin
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
