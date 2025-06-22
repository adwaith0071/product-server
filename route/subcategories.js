// routes/subcategories.js
const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controller/subCategoryController");
const { getProductsBySubCategory } = require("../controller/productController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/subcategories
// @desc    Get all subcategories
// @access  Public
router.get("/", getSubCategories);

// @route   POST /api/subcategories
// @desc    Create new subcategory
// @access  Private
router.post("/", protect, createSubCategory);

// @route   GET /api/subcategories/:id
// @desc    Get single subcategory
// @access  Public
router.get("/:id", getSubCategory);

// @route   PUT /api/subcategories/:id
// @desc    Update subcategory
// @access  Private
router.put("/:id", protect, updateSubCategory);

// @route   DELETE /api/subcategories/:id
// @desc    Delete subcategory
// @access  Private
router.delete("/:id", protect, deleteSubCategory);

// @route   GET /api/subcategories/:subCategoryId/products
// @desc    Get products by subcategory
// @access  Public
router.get("/:subCategoryId/products", getProductsBySubCategory);

module.exports = router;
