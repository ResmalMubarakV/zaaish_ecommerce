const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
    createOrder,
    getMyOrders,
    exportOrdersCSV,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderToPaid,
    requestOrderReturn,
    cancelOrderReturn,
    updateOrderReturnStatus,
    getReturnOrders,
} = require("../controllers/orderController");

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", protect, createOrder);

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get("/my-orders", protect, getMyOrders);

// @route   GET /api/orders/export-csv
// @desc    Export all sales orders as a downloadable CSV file (Admin)
// @access  Private/Admin
router.get("/export-csv", protect, admin, exportOrdersCSV);

// @route   GET /api/orders/returns/all
// @desc    Get all orders with return requests (Admin)
// @access  Private/Admin
router.get("/returns/all", protect, admin, getReturnOrders);

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get("/", protect, admin, getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", protect, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status and optional payment status (Admin)
// @access  Private/Admin
router.put("/:id/status", protect, admin, updateOrderStatus);

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put("/:id/pay", protect, updateOrderToPaid);

// @route   POST /api/orders/:id/return
// @desc    Request product return for delivered order
// @access  Private
router.post("/:id/return", protect, requestOrderReturn);

// @route   PUT /api/orders/:id/return/cancel
// @desc    Cancel a pending return request
// @access  Private
router.put("/:id/return/cancel", protect, cancelOrderReturn);

// @route   PUT /api/orders/:id/return/status
// @desc    Update return request status (Admin)
// @access  Private/Admin
router.put("/:id/return/status", protect, admin, updateOrderReturnStatus);

module.exports = router;