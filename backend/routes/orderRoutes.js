const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", protect, async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No order items provided" });
        }

        // Verify stock availability for each item
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }
            if (product.countInStock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Only ${product.countInStock} left.` 
                });
            }
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || "PayPal",
            itemsPrice,
            shippingPrice: shippingPrice || 0,
            taxPrice: taxPrice || 0,
            totalPrice,
            isPaid: paymentMethod === "Cash on Delivery" ? false : true, // Adjust based on payment gateway flow
            paidAt: paymentMethod === "Cash on Delivery" ? null : Date.now()
        });

        const createdOrder = await order.save();

        // Decrement stock levels
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.quantity }
            });
        }

        // Clear user's cart upon successful order placement
        req.user.cart = [];
        await req.user.save();

        res.status(201).json({ success: true, order: createdOrder });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get logged in user's orders
// @access  Private
router.get("/my-orders", protect, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/orders/export-csv
// @desc    Export all sales orders as a downloadable CSV file (Admin)
// @access  Private/Admin
router.get("/export-csv", protect, admin, async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });

        let csvHeader = "Order ID,Customer Name,Customer Email,Date,Total Amount ($),Payment Status,Fulfillment Status,Payment Method,Items Count\n";
        let csvRows = orders.map(order => {
            const customerName = `"${order.shippingAddress?.firstName || order.user?.name || 'Guest'} ${order.shippingAddress?.lastName || ''}"`.trim();
            const email = order.user?.email || "N/A";
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            const amount = (order.totalPrice || 0).toFixed(2);
            const isPaid = order.isPaid ? "Paid" : "Pending";
            const status = order.status || "Processing";
            const method = order.paymentMethod || "PayPal";
            const itemsCount = order.orderItems ? order.orderItems.length : 0;
            return `"${order._id}",${customerName},"${email}",${date},${amount},${isPaid},${status},"${method}",${itemsCount}`;
        }).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=zaaish_sales_report_${Date.now()}.csv`);
        res.status(200).send(csvHeader + csvRows);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get("/:id", protect, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if user is owner or admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to view this order" });
        }

        res.json({ success: true, order });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order by user
// @access  Private
router.put("/:id/cancel", protect, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if user is owner
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this order" });
        }

        // Can only cancel if status is Processing or pending
        if (order.status && order.status !== "Processing") {
            return res.status(400).json({ success: false, message: `Cannot cancel order which is already ${order.status}` });
        }

        order.status = "Cancelled";
        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder, message: "Order cancelled successfully" });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/orders/:id/return
// @desc    Request return for order by user
// @access  Private
router.put("/:id/return", protect, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if user is owner
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to return this order" });
        }

        // Can only return if status is Delivered
        if (order.status !== "Delivered") {
            return res.status(400).json({ success: false, message: "Can only return orders that are delivered" });
        }

        order.status = "Return Requested";
        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder, message: "Return requested successfully" });
    } catch (error) {
        next(error);
    }
});


// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res, next) => {

    try {
        const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put("/:id/status", protect, admin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.status = status || order.status;
        if (status === "Shipped") {
            order.shippedAt = Date.now();
        } else if (status === "Delivered") {
            order.deliveredAt = Date.now();
            order.isPaid = true;
            if (!order.paidAt) order.paidAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        next(error);
    }
});

module.exports = router;