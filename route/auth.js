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

// Apply rate limiting to auth routes, but ONLY in production.
// This prevents developers from being blocked during testing.
if (process.env.NODE_ENV === "production") {
  const authRateLimit = rateLimit(
    15 * 60 * 1000, // 15 minutes
    20 // 20 requests per 15 mins in production
  );
  router.use(authRateLimit);
}

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
