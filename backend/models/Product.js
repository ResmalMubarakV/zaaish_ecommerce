const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [/^https?:\/\//i, "Image URL must be an HTTP(S) URL"]
    },
    publicId: {
      type: String,
      trim: true,
      default: null
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [180, "Image alt text cannot exceed 180 characters"],
      default: ""
    }
  },
  {
    _id: false,
    strict: "throw"
  }
);

const dimensionsSchema = new mongoose.Schema(
  {
    length: {
      type: Number,
      min: [0, "Length cannot be negative"]
    },
    width: {
      type: Number,
      min: [0, "Width cannot be negative"]
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"]
    },
    unit: {
      type: String,
      enum: ["cm", "in"],
      default: "cm"
    }
  },
  {
    _id: false,
    strict: "throw"
  }
);

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    images: { type: [imageSchema], default: [] }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(


  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [160, "Product name cannot exceed 160 characters"]
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Product description must be at least 10 characters"],
      maxlength: [5000, "Product description cannot exceed 5000 characters"]
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"]
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator(value) {
          return value === null || value === undefined || value <= this.price;
        },
        message: "Discount price cannot exceed the regular price"
      }
    },
    countInStock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be a whole number"
      }
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [80, "SKU cannot exceed 80 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [80, "Category cannot exceed 80 characters"]
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: [80, "Subcategory cannot exceed 80 characters"],
      default: ""
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [80, "Brand cannot exceed 80 characters"],
      default: ""
    },
    sizes: {
      type: [String],
      required: [true, "At least one available size is required"],
      validate: {
        validator: (sizes) => Array.isArray(sizes) && sizes.length > 0,
        message: "At least one available size is required"
      }
    },
    colors: {
      type: [String],
      required: [true, "At least one available color is required"],
      validate: {
        validator: (colors) => Array.isArray(colors) && colors.length > 0,
        message: "At least one available color is required"
      }
    },
    collections: {
      type: String,
      trim: true,
      required: [true, "Collection is required"],
      maxlength: [100, "Collection cannot exceed 100 characters"]
    },
    material: {
      type: String,
      trim: true,
      required: [true, "Material is required"],
      maxlength: [100, "Material cannot exceed 100 characters"]
    },
    gender: {
      type: String,
      enum: {
        values: ["Men", "Women", "Unisex"],
        message: "Gender must be Men, Women, or Unisex"
      },
      required: [true, "Gender is required"]
    },
    images: {
      type: [imageSchema],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (images) => Array.isArray(images) && images.length > 0 && images.length <= 8,
        message: "A product must have between 1 and 8 images"
      }
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"]
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Review count must be a whole number"
      }
    },
    reviews: [reviewSchema],


    tags: {
      type: [String],
      default: []
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product creator is required"]
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [160, "Meta title cannot exceed 160 characters"],
      default: ""
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [320, "Meta description cannot exceed 320 characters"],
      default: ""
    },
    metaKeywords: {
      type: [String],
      default: []
    },
    dimensions: {
      type: dimensionsSchema,
      default: undefined
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"]
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

productSchema.index({ name: "text", description: "text", category: "text", brand: "text", tags: "text" });
productSchema.index({ isPublished: 1, category: 1, subCategory: 1 });
productSchema.index({ isPublished: 1, gender: 1, collections: 1 });
productSchema.index({ category: 1, gender: 1, collections: 1, price: 1 });
productSchema.index({ isPublished: 1, price: 1, createdAt: -1 });

productSchema.virtual("currentPrice").get(function currentPrice() {
  return this.discountPrice !== null && this.discountPrice !== undefined
    ? this.discountPrice
    : this.price;
});

productSchema.virtual("isInStock").get(function isInStock() {
  return this.countInStock > 0;
});

module.exports = mongoose.model("Product", productSchema);
