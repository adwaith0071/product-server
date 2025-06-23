const express = require("express");

// Import route modules
const authRoutes = require("./auth");
const categoryRoutes = require("./categories");
const subCategoryRoutes = require("./subcategories");
const productRoutes = require("./products");
const wishlistRoutes = require("./wishlist");
const additionalRoutes = require("./additional");

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subCategoryRoutes);
router.use("/products", productRoutes);
router.use("/wishlist", wishlistRoutes);

// Mount additional nested routes
router.use("/", additionalRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API info route
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Product Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      subcategories: "/api/subcategories",
      products: "/api/products",
      wishlist: "/api/wishlist",
      health: "/api/health",
    },
    documentation: "Please refer to the API documentation for detailed usage",
  });
});

module.exports = router;
