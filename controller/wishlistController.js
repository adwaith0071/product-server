// controllers/wishlistController.js
const User = require("../model/userModel");
const Product = require("../model/productModel");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user with populated wishlist
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
      options: {
        skip: skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get total wishlist count
    const totalItems = user.wishlist.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        wishlist: user.wishlist,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot add inactive product to wishlist",
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product is already in wishlist",
      });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    // Get updated user with populated wishlist
    const updatedUser = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: {
        wishlist: updatedUser.wishlist,
        totalItems: updatedUser.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    // Get updated user with populated wishlist
    const updatedUser = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: [
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: {
        wishlist: updatedUser.wishlist,
        totalItems: updatedUser.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clear wishlist
    user.wishlist = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: {
        wishlist: [],
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing wishlist",
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isInWishlist = user.wishlist.includes(productId);

    res.status(200).json({
      success: true,
      data: {
        productId,
        isInWishlist,
      },
    });
  } catch (error) {
    console.error("Check wishlist status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking wishlist status",
    });
  }
};

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
const getWishlistCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wishlist");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        count: user.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Get wishlist count error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while getting wishlist count",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlistStatus,
  getWishlistCount,
};
