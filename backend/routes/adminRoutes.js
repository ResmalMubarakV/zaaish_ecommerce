const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics (Revenue, Total Orders, Total Products, Total Users)
// @access  Private/Admin
router.get("/stats", protect, admin, async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });

        // Calculate total revenue from paid orders
        const orders = await Order.find({ isPaid: true });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Fetch recent orders for the Admin Home page table
        const recentOrders = await Order.find({})
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
            },
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin UserManagement page)
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user by ID
// @access  Private/Admin
router.delete("/users/:id", protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === "admin") {
            return res.status(400).json({ success: false, message: "Cannot delete an administrator account" });
        }

        await user.deleteOne();
        res.json({ success: true, message: "User removed successfully" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;