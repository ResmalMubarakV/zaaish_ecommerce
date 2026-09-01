const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
    getAdminStats,
    getAllUsers,
    deleteUser,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect, admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics (Revenue, Total Orders, Total Products, Total Users)
// @access  Private/Admin
router.get("/stats", getAdminStats);

// @route   GET /api/admin/users
// @desc    Get all users (Admin UserManagement page)
// @access  Private/Admin
router.get("/users", getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user by ID
// @access  Private/Admin
router.delete("/users/:id", deleteUser);

module.exports = router;