const Coupon = require("../models/Coupon");

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: coupons.length,
            coupons,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public active coupons for storefront checkout offers
// @route   GET /api/coupons/active
// @access  Public
const getActivePublicCoupons = async (req, res, next) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        })
            .select("code description discountType discountValue minOrderAmount maxDiscountAmount")
            .limit(6);

        res.json({
            success: true,
            coupons,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            usageLimit,
            expiresAt,
            isActive,
        } = req.body;

        if (!code || typeof code !== "string" || code.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a valid coupon code" });
        }

        const normalizedCode = code.trim().toUpperCase();
        const existing = await Coupon.findOne({ code: normalizedCode });
        if (existing) {
            return res.status(400).json({ success: false, message: "A coupon with this code already exists" });
        }

        if (discountValue === undefined || Number(discountValue) <= 0) {
            return res.status(400).json({ success: false, message: "Discount value must be greater than 0" });
        }

        if (discountType === "percentage" && Number(discountValue) > 100) {
            return res.status(400).json({ success: false, message: "Percentage discount cannot exceed 100%" });
        }

        const coupon = new Coupon({
            code: normalizedCode,
            description: description || "",
            discountType: discountType || "percentage",
            discountValue: Number(discountValue),
            minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        });

        const savedCoupon = await coupon.save();
        res.status(201).json({
            success: true,
            message: `Coupon ${savedCoupon.code} created successfully`,
            coupon: savedCoupon,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            usageLimit,
            expiresAt,
            isActive,
        } = req.body;

        if (code) {
            const normalizedCode = code.trim().toUpperCase();
            if (normalizedCode !== coupon.code) {
                const existing = await Coupon.findOne({ code: normalizedCode });
                if (existing) {
                    return res.status(400).json({ success: false, message: "A coupon with this code already exists" });
                }
                coupon.code = normalizedCode;
            }
        }

        if (description !== undefined) coupon.description = description;
        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
        if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
        if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
        if (expiresAt !== undefined) coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (isActive !== undefined) coupon.isActive = Boolean(isActive);

        const updatedCoupon = await coupon.save();
        res.json({
            success: true,
            message: "Coupon updated successfully",
            coupon: updatedCoupon,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: `Coupon ${coupon.code} deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate coupon code against cart amount
// @route   POST /api/coupons/validate
// @access  Public / Private
const validateCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code || typeof code !== "string" || code.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a coupon code" });
        }

        const normalizedCode = code.trim().toUpperCase();
        const amount = Number(orderAmount) || 0;

        // Check fallback presets for backwards compatibility
        if (normalizedCode === "ZAAISH10" || normalizedCode === "WELCOME10" || normalizedCode === "LUXURY") {
            const discount = Number((amount * 0.1).toFixed(2));
            return res.json({
                success: true,
                valid: true,
                code: normalizedCode,
                discountType: "percentage",
                discountValue: 10,
                discountAmount: discount,
                finalTotal: Math.max(0, amount - discount),
                message: `🎉 Code ${normalizedCode} applied (10% discount)`,
            });
        }

        const coupon = await Coupon.findOne({ code: normalizedCode });
        if (!coupon) {
            return res.status(404).json({ success: false, valid: false, message: "Invalid or non-existent promo code" });
        }

        const validation = coupon.isValid(amount);
        if (!validation.valid) {
            return res.status(400).json({ success: false, valid: false, message: validation.message });
        }

        const discountAmount = coupon.calculateDiscount(amount);
        const finalTotal = Math.max(0, amount - discountAmount);

        res.json({
            success: true,
            valid: true,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
            finalTotal,
            message: `🎉 Code ${coupon.code} applied (${coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`})`,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCoupons,
    getActivePublicCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
};
