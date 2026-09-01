const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Get dashboard metrics (Revenue, Total Orders, Total Products, Total Users)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalReturns = await Order.countDocuments({ "returnRequest.status": { $ne: "None" } });

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
                totalReturns,
            },
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin UserManagement page)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
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
};

module.exports = {
    getAdminStats,
    getAllUsers,
    deleteUser,
};
