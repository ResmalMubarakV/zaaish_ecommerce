const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to safely calculate total cart item quantity
const getCartItemCount = (cart) => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", protect, async (req, res, next) => {
    try {
        await req.user.populate("cart.product");

        res.json({
            success: true,
            cart: req.user.cart,
            cartItemCount: getCartItemCount(req.user.cart)
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity if it exists
// @access  Private
router.post("/", protect, async (req, res, next) => {
    try {
        const { productId, size, color, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const qty = quantity ? parseInt(quantity, 10) : 1;

        // Check if item with same product, size, and color already exists in cart
        const existingItemIndex = req.user.cart.findIndex(
            (item) => item.product.toString() === productId && item.size === size && item.color === color
        );

        if (existingItemIndex > -1) {
            req.user.cart[existingItemIndex].quantity += qty;
        } else {
            req.user.cart.push({
                product: productId,
                size,
                color,
                quantity: qty
            });
        }

        await req.user.save();
        await req.user.populate("cart.product");

        res.json({
            success: true,
            message: "Cart updated successfully",
            cart: req.user.cart,
            cartItemCount: getCartItemCount(req.user.cart)
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item details
// @access  Private
router.put("/:itemId", protect, async (req, res, next) => {
    try {
        const { quantity, size, color } = req.body;
        const { itemId } = req.params;

        const cartItem = req.user.cart.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        if (quantity !== undefined) {
            const newQty = parseInt(quantity, 10);
            if (newQty <= 0) {
                cartItem.deleteOne();
            } else {
                cartItem.quantity = newQty;
            }
        }
        if (size !== undefined) {
            cartItem.size = size;
        }
        if (color !== undefined) {
            cartItem.color = color;
        }

        await req.user.save();
        await req.user.populate("cart.product");

        res.json({
            success: true,
            message: "Cart item details updated",
            cart: req.user.cart,
            cartItemCount: getCartItemCount(req.user.cart)
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete("/:itemId", protect, async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const cartItem = req.user.cart.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }

        cartItem.deleteOne();
        await req.user.save();
        await req.user.populate("cart.product");

        res.json({
            success: true,
            message: "Item removed from cart",
            cart: req.user.cart,
            cartItemCount: getCartItemCount(req.user.cart)
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete("/", protect, async (req, res, next) => {
    try {
        req.user.cart = [];
        await req.user.save();

        res.json({
            success: true,
            message: "Cart cleared successfully",
            cart: [],
            cartItemCount: 0
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;