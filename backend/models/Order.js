const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Order item product is required"]
    },
    name: {
      type: String,
      required: [true, "Order item name is required"],
      trim: true,
      maxlength: [160, "Order item name cannot exceed 160 characters"]
    },
    image: {
      type: String,
      required: [true, "Order item image is required"],
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      default: "N/A",
      maxlength: [80, "Order item SKU cannot exceed 80 characters"]
    },
    price: {
      type: Number,
      required: [true, "Order item price is required"],
      min: [0, "Order item price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: [true, "Order item quantity is required"],
      min: [1, "Order item quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Order item quantity must be a whole number"
      }
    },
    size: {
      type: String,
      trim: true,
      default: "Standard",
      maxlength: [30, "Order item size cannot exceed 30 characters"]
    },
    color: {
      type: String,
      trim: true,
      default: "Standard",
      maxlength: [50, "Order item color cannot exceed 50 characters"]
    }
  },
  {
    _id: false,
    strict: "throw",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderItemSchema.virtual("productId").get(function productId() {
  return this.product;
});

const shippingAddressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Shipping first name is required"],
      trim: true,
      maxlength: [60, "Shipping first name cannot exceed 60 characters"]
    },
    lastName: {
      type: String,
      required: [true, "Shipping last name is required"],
      trim: true,
      maxlength: [60, "Shipping last name cannot exceed 60 characters"]
    },
    address: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
      maxlength: [200, "Shipping address cannot exceed 200 characters"]
    },
    city: {
      type: String,
      required: [true, "Shipping city is required"],
      trim: true,
      maxlength: [80, "Shipping city cannot exceed 80 characters"]
    },
    state: {
      type: String,
      trim: true,
      maxlength: [80, "Shipping state cannot exceed 80 characters"],
      default: ""
    },
    postalCode: {
      type: String,
      required: [true, "Shipping postal code is required"],
      trim: true,
      maxlength: [20, "Shipping postal code cannot exceed 20 characters"]
    },
    country: {
      type: String,
      required: [true, "Shipping country is required"],
      trim: true,
      maxlength: [80, "Shipping country cannot exceed 80 characters"]
    },
    phone: {
      type: String,
      required: [true, "Shipping phone number is required"],
      trim: true,
      match: [/^[+()\-\s\d]{7,20}$/, "Please provide a valid shipping phone number"]
    }
  },
  {
    _id: false,
    strict: "throw"
  }
);

const paymentResultSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      trim: true,
      default: ""
    },
    updateTime: {
      type: Date,
      default: null
    },
    emailAddress: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    }
  },
  {
    _id: false,
    strict: "throw"
  }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountName: { type: String, trim: true, default: "" },
    accountNumber: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    upiId: { type: String, trim: true, default: "" }
  },
  { _id: false, strict: "throw" }
);

const returnRequestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: ["None", "Pending", "Approved", "Rejected", "Pickup Scheduled", "Refunded", "Completed", "Cancelled"],
        message: "Invalid return status"
      },
      default: "None"
    },
    reason: {
      type: String,
      trim: true,
      default: ""
    },
    comments: {
      type: String,
      trim: true,
      default: ""
    },
    items: {
      type: [orderItemSchema],
      default: []
    },
    requestedAt: {
      type: Date,
      default: null
    },
    pickupDate: {
      type: Date,
      default: null
    },
    adminResponse: {
      type: String,
      trim: true,
      default: ""
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, "Refund amount cannot be negative"]
    },
    refundStatus: {
      type: String,
      enum: {
        values: ["Pending", "Processed", "Rejected", "N/A"],
        message: "Invalid refund status"
      },
      default: "N/A"
    },
    refundMethod: {
      type: String,
      trim: true,
      default: "Original Payment Method"
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({})
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false, strict: "throw" }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order user is required"]
    },
    orderItems: {
      type: [orderItemSchema],
      required: [true, "An order must contain at least one item"],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "An order must contain at least one item"
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"]
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["PayPal", "Cash on Delivery", "Credit Card", "Card", "Online Payment", "UPI"],
        message: "Payment method must be valid"
      },
      default: "PayPal"
    },
    paymentResult: {
      type: paymentResultSchema,
      default: undefined
    },
    itemsPrice: {
      type: Number,
      required: [true, "Items price is required"],
      min: [0, "Items price cannot be negative"]
    },
    shippingPrice: {
      type: Number,
      required: [true, "Shipping price is required"],
      min: [0, "Shipping price cannot be negative"],
      default: 0
    },
    taxPrice: {
      type: Number,
      required: [true, "Tax price is required"],
      min: [0, "Tax price cannot be negative"],
      default: 0
    },
    codFee: {
      type: Number,
      min: [0, "COD fee cannot be negative"],
      default: 0
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"]
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      enum: ["INR", "USD"],
      default: "INR"
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ["Processing", "Shipped", "Delivered", "Cancelled"],
        message: "Order status must be Processing, Shipped, Delivered, or Cancelled"
      },
      default: "Processing"
    },
    shippedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    returnRequest: {
      type: returnRequestSchema,
      default: () => ({ status: "None", refundStatus: "N/A" })
    }
  },
  {
    timestamps: true,
    strict: "throw",
    toJSON: {
      virtuals: true,
      transform: (document, returnedObject) => {
        delete returnedObject.__v;
        return returnedObject;
      }
    },
    toObject: {
      virtuals: true,
      transform: (document, returnedObject) => {
        delete returnedObject.__v;
        return returnedObject;
      }
    }
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.virtual("itemCount").get(function itemCount() {
  return this.orderItems.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual("isDelivered").get(function isDelivered() {
  return this.status === "Delivered";
});

module.exports = mongoose.model("Order", orderSchema);
