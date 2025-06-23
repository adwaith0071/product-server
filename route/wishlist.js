const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
  getWishlistCount,
} = require("../controller/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get("/", getWishlist);

// @route   GET /api/wishlist/count
// @desc    Get wishlist items count
// @access  Private
router.get("/count", getWishlistCount);

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get("/check/:productId", checkWishlistStatus);

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post("/:productId", addToWishlist);

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete("/:productId", removeFromWishlist);

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete("/", clearWishlist);

module.exports = router;
