const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsBySubCategory,
  searchProducts,
} = require("../controller/productController");
const { protect, optionalAuth } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get("/search", searchProducts);

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get("/", optionalAuth, getProducts);

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post("/", protect, upload.array("images", 5), createProduct);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", optionalAuth, getProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put("/:id", protect, upload.array("images", 5), updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete("/:id", protect, deleteProduct);

module.exports = router;
