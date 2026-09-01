const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
            required: true,
        },
        discountValue: {
            type: Number,
            required: [true, "Discount value is required"],
            min: [0, "Discount value cannot be negative"],
        },
        minOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        maxDiscountAmount: {
            type: Number,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: null,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if coupon is currently valid
couponSchema.methods.isValid = function (orderAmount = 0) {
    if (!this.isActive) {
        return { valid: false, message: "This coupon is currently inactive" };
    }

    if (this.expiresAt && new Date() > new Date(this.expiresAt)) {
        return { valid: false, message: "This coupon has expired" };
    }

    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: "Coupon redemption limit has been reached" };
    }

    if (orderAmount < this.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order amount of ₹${this.minOrderAmount.toFixed(2)} is required for this coupon`,
        };
    }

    return { valid: true };
};

// Method to compute calculated discount
couponSchema.methods.calculateDiscount = function (orderAmount = 0) {
    let discount = 0;

    if (this.discountType === "percentage") {
        discount = (orderAmount * this.discountValue) / 100;
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    } else {
        discount = Math.min(this.discountValue, orderAmount);
    }

    return Number(discount.toFixed(2));
};

module.exports = mongoose.model("Coupon", couponSchema);
