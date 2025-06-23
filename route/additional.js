const express = require("express");
const {
  getSubCategoriesByCategory,
} = require("../controller/subCategoryController");
const { getProductsBySubCategory } = require("../controller/productController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/categories/:categoryId/subcategories
// @desc    Get subcategories by category
// @access  Public
router.get("/categories/:categoryId/subcategories", getSubCategoriesByCategory);

// @route   GET /api/subcategories/:subCategoryId/products
// @desc    Get products by subcategory
// @access  Public
router.get(
  "/subcategories/:subCategoryId/products",
  optionalAuth,
  getProductsBySubCategory
);

module.exports = router;
