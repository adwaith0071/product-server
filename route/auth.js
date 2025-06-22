// routes/auth.js
const express = require("express");
const {
  signup,
  login,
  getMe,
  logout,
} = require("../controller/authController");
const { protect, rateLimit } = require("../middleware/auth");

const router = express.Router();

// Apply rate limiting to auth routes.
// We make it more lenient in development to avoid being blocked during testing.
const isDevelopment = process.env.NODE_ENV === "development";
const authRateLimit = rateLimit(
  15 * 60 * 1000, // 15 minutes
  isDevelopment ? 100 : 20 // 100 requests in dev, 20 in production
);

router.use(authRateLimit);

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post("/signup", signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", protect, logout);

module.exports = router;
