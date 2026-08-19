const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        user = new User({ name, email, password });
        await user.save();

        // Standardized JWT payload
        const payload = { id: user._id, role: user.role };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
            if (err) throw err;

            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Explicitly include +password since password field is hidden by default in the schema
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Standardized JWT payload
        const payload = { id: user._id, role: user.role };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
            if (err) throw err;

            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            });
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/users/profile
// @desc    Get logged-in user profile
// @access  Private
router.get("/profile", protect, async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;