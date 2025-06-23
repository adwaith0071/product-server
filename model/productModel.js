const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  ram: {
    type: String,
    required: [true, "RAM specification is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    default: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [2, "Product title must be at least 2 characters long"],
      maxlength: [100, "Product title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Sub-category is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    variants: {
      type: [variantSchema],
      required: [true, "At least one variant is required"],
      validate: {
        validator: function (variants) {
          return variants && variants.length > 0;
        },
        message: "Product must have at least one variant",
      },
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for total stock across all variants
productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((total, variant) => total + variant.quantity, 0);
});

// Virtual for price range
productSchema.virtual("priceRange").get(function () {
  if (this.variants.length === 0) return { min: 0, max: 0 };

  const prices = this.variants.map((v) => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
});

// Indexes for better query performance
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "rating.average": -1 });

module.exports = mongoose.model("Product", productSchema);
