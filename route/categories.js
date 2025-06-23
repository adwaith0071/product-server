const express = require("express");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categoryController");
const { getProductsByCategory } = require("../controller/productController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get("/", getCategories);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post("/", protect, createCategory);

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get("/:id", getCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put("/:id", protect, updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete("/:id", protect, deleteCategory);

// @route   GET /api/categories/:categoryId/products
// @desc    Get products by category
// @access  Public
router.get("/:categoryId/products", getProductsByCategory);

module.exports = router;
