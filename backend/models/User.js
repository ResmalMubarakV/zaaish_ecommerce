const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: [40, "Address label cannot exceed 40 characters"],
      default: "Home"
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "Recipient first name is required"],
      minlength: [2, "Recipient first name must be at least 2 characters"],
      maxlength: [60, "Recipient first name cannot exceed 60 characters"]
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Recipient last name is required"],
      minlength: [2, "Recipient last name must be at least 2 characters"],
      maxlength: [60, "Recipient last name cannot exceed 60 characters"]
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [/^[+()\-\s\d]{7,20}$/, "Please provide a valid phone number"]
    },
    address: {
      type: String,
      trim: true,
      required: [true, "Address is required"],
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    city: {
      type: String,
      trim: true,
      required: [true, "City is required"],
      maxlength: [80, "City cannot exceed 80 characters"]
    },
    state: {
      type: String,
      trim: true,
      maxlength: [80, "State cannot exceed 80 characters"],
      default: ""
    },
    postalCode: {
      type: String,
      trim: true,
      required: [true, "Postal code is required"],
      maxlength: [20, "Postal code cannot exceed 20 characters"]
    },
    country: {
      type: String,
      trim: true,
      required: [true, "Country is required"],
      maxlength: [80, "Country cannot exceed 80 characters"]
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true,
    strict: "throw"
  }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Cart item product is required"]
    },
    size: {
      type: String,
      trim: true,
      required: [true, "Selected size is required"],
      maxlength: [30, "Size cannot exceed 30 characters"]
    },
    color: {
      type: String,
      trim: true,
      required: [true, "Selected color is required"],
      maxlength: [50, "Color cannot exceed 50 characters"]
    },
    quantity: {
      type: Number,
      required: [true, "Cart item quantity is required"],
      min: [1, "Cart item quantity must be at least 1"],
      max: [100, "Cart item quantity cannot exceed 100"],
      validate: {
        validator: Number.isInteger,
        message: "Cart item quantity must be a whole number"
      }
    }
  },
  {
    _id: true,
    timestamps: true,
    strict: "throw",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

cartItemSchema.virtual("productId").get(function productId() {
  return this.product;
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either user or admin"
      },
      default: "user"
    },
    shippingAddresses: {
      type: [addressSchema],
      default: []
    },
    cart: {
      type: [cartItemSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    strict: "throw",
    toJSON: {
      virtuals: true,
      transform: (document, returnedObject) => {
        delete returnedObject.__v;
        delete returnedObject.password;
        return returnedObject;
      }
    },
    toObject: {
      virtuals: true,
      transform: (document, returnedObject) => {
        delete returnedObject.__v;
        delete returnedObject.password;
        return returnedObject;
      }
    }
  }
);

// FIXED: Safe optional chaining and fallback array to prevent reduce errors
userSchema.virtual("cartItemCount").get(function cartItemCount() {
  return (this.cart || []).reduce((total, item) => total + item.quantity, 0);
});

userSchema.pre("validate", function normalizeDefaultAddress() {
  const defaultAddresses = this.shippingAddresses.filter((address) => address.isDefault);

  if (defaultAddresses.length > 1) {
    throw new Error("Only one shipping address can be marked as default");
  }

  if (this.shippingAddresses.length > 0 && defaultAddresses.length === 0) {
    this.shippingAddresses[0].isDefault = true;
  }
});

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);