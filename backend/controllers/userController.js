const User = require("../models/User");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register a new user with input validation
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({ success: false, message: "Please provide a valid name (minimum 2 characters)" });
        }

        if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address" });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        user = new User({ name: name.trim(), email: normalizedEmail, password });
        await user.save();

        const payload = { id: user._id, role: user.role };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
            if (err) throw err;

            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    wishlist: user.wishlist || []
                },
                token,
            });
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Please provide a valid email address" });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({ success: false, message: "Please provide a password" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const payload = { id: user._id, role: user.role };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" }, (err, token) => {
            if (err) throw err;

            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    wishlist: user.wishlist || []
                },
                token,
            });
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle product in user's wishlist
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const user = await User.findById(req.user._id);
        const existsIndex = user.wishlist.findIndex(id => id.toString() === productId);

        let action = "added";
        if (existsIndex > -1) {
            user.wishlist.splice(existsIndex, 1);
            action = "removed";
        } else {
            user.wishlist.push(productId);
        }

        await user.save();

        res.json({
            success: true,
            action,
            message: action === "added" ? "Added to wishlist" : "Removed from wishlist",
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's populated wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        res.json({
            success: true,
            wishlist: user.wishlist || []
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    toggleWishlist,
    getWishlist,
};
