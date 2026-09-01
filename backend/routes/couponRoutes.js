const express = require("express");
const router = express.Router();
const {
    getAllCoupons,
    getActivePublicCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
} = require("../controllers/couponController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes for checkout
router.post("/validate", validateCoupon);
router.get("/active", getActivePublicCoupons);

// Admin-only management routes
router.route("/").get(protect, admin, getAllCoupons).post(protect, admin, createCoupon);
router.route("/:id").put(protect, admin, updateCoupon).delete(protect, admin, deleteCoupon);

module.exports = router;
