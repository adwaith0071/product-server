// models/SubCategory.js
const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sub-category name is required"],
      trim: true,
      minlength: [2, "Sub-category name must be at least 2 characters long"],
      maxlength: [50, "Sub-category name cannot exceed 50 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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

// Compound index to ensure unique subcategory names within a category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model("SubCategory", subCategorySchema);
