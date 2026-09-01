const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiterMiddleware");
const {
    registerUser,
    loginUser,
    getUserProfile,
    toggleWishlist,
    getWishlist,
} = require("../controllers/userController");

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user with input validation and rate limiting
// @access  Public
router.post("/register", authRateLimiter, registerUser);

// @route   POST /api/users/login
// @desc    Authenticate user & get token with rate limiting
// @access  Public
router.post("/login", authRateLimiter, loginUser);

// @route   GET /api/users/profile
// @desc    Get logged-in user profile
// @access  Private
router.get("/profile", protect, getUserProfile);

// @route   POST /api/users/wishlist
// @desc    Toggle product in user's wishlist
// @access  Private
router.post("/wishlist", protect, toggleWishlist);

// @route   GET /api/users/wishlist
// @desc    Get user's populated wishlist
// @access  Private
router.get("/wishlist", protect, getWishlist);

module.exports = router;