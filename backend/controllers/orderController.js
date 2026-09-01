const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            codFee,
            totalPrice,
            paymentResult
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No order items provided" });
        }

        if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.address) {
            return res.status(400).json({ success: false, message: "Complete shipping address is required" });
        }

        // Verify stock availability for each item
        for (const item of orderItems) {
            if (item.product) {
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
        }

        const isCOD = paymentMethod === "Cash on Delivery";
        const finalCodFee = isCOD ? (codFee !== undefined ? Number(codFee) : 60) : 0;
        const computedTotal = totalPrice !== undefined 
            ? Number(totalPrice) 
            : Number(itemsPrice || 0) + Number(shippingPrice || 0) + Number(taxPrice || 0) + finalCodFee;

        const order = new Order({
            user: req.user._id,
            orderItems: orderItems.map(item => ({
                product: item.product,
                name: item.name,
                image: item.image || "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
                sku: item.sku || "ZSH-ITEM",
                price: Number(item.price),
                quantity: Number(item.quantity),
                size: item.size || "Standard",
                color: item.color || "Standard"
            })),
            shippingAddress,
            paymentMethod: paymentMethod || "PayPal",
            paymentResult: paymentResult || undefined,
            itemsPrice: Number(itemsPrice || 0),
            shippingPrice: Number(shippingPrice || 0),
            taxPrice: Number(taxPrice || 0),
            codFee: finalCodFee,
            totalPrice: computedTotal,
            currency: "INR",
            isPaid: isCOD ? false : true,
            paidAt: isCOD ? null : Date.now(),
            status: "Processing"
        });

        const createdOrder = await order.save();

        // Decrement stock levels
        for (const item of orderItems) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { countInStock: -Number(item.quantity) }
                });
            }
        }

        // Clear user's cart upon successful order placement
        req.user.cart = [];
        await req.user.save();

        res.status(201).json({ success: true, order: createdOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Export all sales orders as a downloadable CSV file (Admin)
// @route   GET /api/orders/export-csv
// @access  Private/Admin
const exportOrdersCSV = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });

        let csvHeader = "Order ID,Customer Name,Customer Email,Date,Total Amount (INR),COD Fee (INR),Payment Status,Fulfillment Status,Payment Method,Items Count,Phone,Shipping City,Shipping Country\n";
        let csvRows = orders.map(order => {
            const customerName = `"${order.shippingAddress?.firstName || order.user?.name || 'Guest'} ${order.shippingAddress?.lastName || ''}"`.trim();
            const email = order.user?.email || "N/A";
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            const amount = (order.totalPrice || 0).toFixed(2);
            const cod = (order.codFee || 0).toFixed(2);
            const isPaid = order.isPaid ? "Paid" : "Pending";
            const status = order.status || "Processing";
            const method = order.paymentMethod || "PayPal";
            const itemsCount = order.orderItems ? order.orderItems.length : 0;
            const phone = order.shippingAddress?.phone || "N/A";
            const city = order.shippingAddress?.city || "N/A";
            const country = order.shippingAddress?.country || "India";
            return `"${order._id}",${customerName},"${email}",${date},${amount},${cod},${isPaid},${status},"${method}",${itemsCount},"${phone}","${city}","${country}"`;
        }).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=zaaish_sales_report_${Date.now()}.csv`);
        res.status(200).send(csvHeader + csvRows);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
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
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status and optional payment status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, isPaid } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (status) {
            order.status = status;
            if (status === "Shipped") {
                order.shippedAt = Date.now();
            } else if (status === "Delivered") {
                order.deliveredAt = Date.now();
                // When marked delivered, COD orders are paid upon delivery
                order.isPaid = true;
                if (!order.paidAt) order.paidAt = Date.now();
            }
        }

        if (isPaid !== undefined) {
            order.isPaid = Boolean(isPaid);
            if (order.isPaid && !order.paidAt) {
                order.paidAt = Date.now();
            }
        }

        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        if (req.body.paymentResult) {
            order.paymentResult = req.body.paymentResult;
        }

        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    exportOrdersCSV,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderToPaid,
};
