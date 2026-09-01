const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require("../controllers/cartController");

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", getCart);

// @route   POST /api/cart
// @desc    Add item to cart or update quantity if it exists
// @access  Private
router.post("/", addToCart);

// @route   PUT /api/cart/:itemId
// @desc    Update cart item details
// @access  Private
router.put("/:itemId", updateCartItem);

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete("/:itemId", removeCartItem);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete("/", clearCart);

module.exports = router;