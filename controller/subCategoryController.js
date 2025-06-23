const SubCategory = require("../model/subCategoryModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

// @desc    Create new subcategory
// @route   POST /api/subcategories
// @access  Private
const createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and category are required",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category is active
    if (!categoryExists.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create subcategory for inactive category",
      });
    }

    // Check if subcategory already exists in this category (case insensitive)
    const existingSubCategory = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      category: category,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory with this name already exists in this category",
      });
    }

    // Create subcategory
    const subCategory = await SubCategory.create({
      name: name.trim(),
      category,
      description: description?.trim(),
      createdBy: req.user.id,
    });

    await subCategory.populate([
      { path: "category", select: "name" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: { subCategory },
    });
  } catch (error) {
    console.error("Create subcategory error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating subcategory",
    });
  }
};

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, isActive } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get subcategories with pagination
    const subCategories = await SubCategory.find(query)
      .populate("category", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalSubCategories = await SubCategory.countDocuments(query);
    const totalPages = Math.ceil(totalSubCategories / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        subCategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubCategories,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get subcategories error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subcategories",
    });
  }
};

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
const getSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate("category", "name")
      .populate("createdBy", "name email");

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // Get products count for this subcategory
    const productsCount = await Product.countDocuments({
      subCategory: subCategory._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        subCategory,
        productsCount,
      },
    });
  } catch (error) {
    console.error("Get subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subcategory",
    });
  }
};

// @desc    Get subcategories by category
// @route   GET /api/categories/:categoryId/subcategories
// @access  Public
const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { isActive = true } = req.query;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Build query
    const query = { category: categoryId };
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const subCategories = await SubCategory.find(query)
      .select("name description isActive")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        category: {
          id: category._id,
          name: category.name,
        },
        subCategories,
      },
    });
  } catch (error) {
    console.error("Get subcategories by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching subcategories",
    });
  }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private
const updateSubCategory = async (req, res) => {
  try {
    const { name, description, isActive, category } = req.body;

    // Find subcategory
    const subCategory = await SubCategory.findById(req.params.id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // If category is being updated, check if it exists
    if (category && category !== subCategory.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Check if new name already exists in the category
    if (name && name !== subCategory.name) {
      const targetCategory = category || subCategory.category;
      const existingSubCategory = await SubCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        category: targetCategory,
        _id: { $ne: req.params.id },
      });

      if (existingSubCategory) {
        return res.status(400).json({
          success: false,
          message: "Subcategory with this name already exists in this category",
        });
      }
    }

    // Update subcategory
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(isActive !== undefined && { isActive }),
        ...(category && { category }),
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "category", select: "name" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: { subCategory: updatedSubCategory },
    });
  } catch (error) {
    console.error("Update subcategory error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating subcategory",
    });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // Check if subcategory has products
    const productsCount = await Product.countDocuments({
      subCategory: req.params.id,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete subcategory with existing products",
      });
    }

    await SubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subcategory",
    });
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
};
