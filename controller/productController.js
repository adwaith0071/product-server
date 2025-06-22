// controllers/productController.js
const Product = require("../model/productModel");
const SubCategory = require("../model/subCategoryModel");
const Category = require("../model/categoryModel");
const { deleteImage } = require("../config/cloudinary");

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { title, description, subCategory } = req.body;
    let variants;

    // Parse variants from string to JSON
    try {
      variants = req.body.variants ? JSON.parse(req.body.variants) : [];
    } catch (e) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for variants. It must be a valid JSON array string.",
      });
    }

    // --- DEBUGGING ---
    console.log("--- AFTER PARSING ---");
    console.log("Request Body:", req.body);
    console.log("Parsed Variants:", variants);
    console.log("Type of Variants:", typeof variants);
    console.log("Is Variants an Array:", Array.isArray(variants));
    console.log("---------------------");

    // Validation
    if (
      !title ||
      !description ||
      !subCategory ||
      !variants ||
      !Array.isArray(variants) ||
      variants.length === 0
    ) {
      console.log("Validation failed:");
      console.log("title:", title);
      console.log("description:", description);
      console.log("subCategory:", subCategory);
      console.log("variants:", variants);
      console.log("variants type:", typeof variants);
      console.log("variants is array:", Array.isArray(variants));

      return res.status(400).json({
        success: false,
        message:
          "Title, description, subcategory, and at least one variant are required",
      });
    }

    // Check if subcategory exists and get its category
    const subCategoryDoc = await SubCategory.findById(subCategory).populate(
      "category"
    );
    if (!subCategoryDoc) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (!subCategoryDoc.isActive || !subCategoryDoc.category.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create product for inactive subcategory or category",
      });
    }

    // Validate variants
    for (const variant of variants) {
      if (
        !variant.ram ||
        variant.price === undefined ||
        variant.quantity === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Each variant must have ram, price, and quantity",
        });
      }
      if (variant.price < 0 || variant.quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Price and quantity cannot be negative",
        });
      }
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push({
          public_id: file.filename, // Cloudinary public_id
          url: file.path, // Cloudinary URL
          alt: file.originalname || "",
        });
      }
    }

    // Create product
    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      subCategory: subCategoryDoc._id,
      category: subCategoryDoc.category._id,
      variants,
      images,
      createdBy: req.user.id,
    });

    await product.populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Create product error:", error);

    // If there's an error and images were uploaded, delete them from Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImage(file.filename);
        } catch (deleteError) {
          console.error("Error deleting image from Cloudinary:", deleteError);
        }
      }
    }

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
      message: "Server error while creating product",
    });
  }
};

// @desc    Get all products with filtering, search and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive,
    } = req.query;

    // Build query
    const query = {};

    // Only add isActive filter if explicitly provided
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Only add text search if search parameter is provided and not empty
    if (search && search.trim() !== "") {
      query.$text = { $search: search.trim() };
    }

    if (category) {
      query.category = category;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Price filter (check against all variants)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);

      query["variants.price"] = priceFilter;
    }

    // Debug: Log the query
    console.log("getProducts query:", JSON.stringify(query, null, 2));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get products with pagination
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    // Debug: Log the results
    console.log(
      `Found ${products.length} products out of ${totalProducts} total`
    );

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("subCategory", "name")
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { title, description, subCategory, isActive } = req.body;

    let variants;
    // Parse variants if provided
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid format for variants. It must be a valid JSON array string.",
        });
      }
    }

    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If subcategory is being updated, validate it
    if (subCategory && subCategory !== product.subCategory.toString()) {
      const subCategoryDoc = await SubCategory.findById(subCategory).populate(
        "category"
      );
      if (!subCategoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
        });
      }
    }

    // Validate variants if provided
    if (variants && Array.isArray(variants)) {
      if (variants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one variant is required",
        });
      }

      for (const variant of variants) {
        if (
          !variant.ram ||
          variant.price === undefined ||
          variant.quantity === undefined
        ) {
          return res.status(400).json({
            success: false,
            message: "Each variant must have ram, price, and quantity",
          });
        }
        if (variant.price < 0 || variant.quantity < 0) {
          return res.status(400).json({
            success: false,
            message: "Price and quantity cannot be negative",
          });
        }
      }
    }

    // Process new uploaded images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        newImages.push({
          public_id: file.filename,
          url: file.path,
          alt: file.originalname || "",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (subCategory) {
      updateData.subCategory = subCategory;
      // Update category too if subcategory changed
      const subCategoryDoc = await SubCategory.findById(subCategory);
      if (subCategoryDoc) {
        updateData.category = subCategoryDoc.category;
      }
    }
    if (variants) updateData.variants = variants;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle image updates
    if (req.body.replaceImages === "true" && newImages.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            await deleteImage(image.public_id);
          } catch (deleteError) {
            console.error(
              "Error deleting old image from Cloudinary:",
              deleteError
            );
          }
        }
      }
      updateData.images = newImages;
    } else if (newImages.length > 0) {
      // Add new images to existing ones
      updateData.images = [...product.images, ...newImages];
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error("Update product error:", error);

    // If there's an error and new images were uploaded, delete them from Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await deleteImage(file.filename);
        } catch (deleteError) {
          console.error("Error deleting image from Cloudinary:", deleteError);
        }
      }
    }

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
      message: "Server error while updating product",
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          await deleteImage(image.public_id);
        } catch (deleteError) {
          console.error("Error deleting image from Cloudinary:", deleteError);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

// @desc    Get products by subcategory
// @route   GET /api/subcategories/:subCategoryId/products
// @access  Public
const getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Check if subcategory exists
    const subCategory = await SubCategory.findById(subCategoryId).populate(
      "category"
    );
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // Build query
    const query = { subCategory: subCategoryId, isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get products
    const products = await Product.find(query)
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        subCategory: {
          id: subCategory._id,
          name: subCategory.name,
          category: subCategory.category,
        },
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products by subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search products
    const products = await Product.find({
      $text: { $search: q.trim() },
      isActive: true,
    })
      .populate("category", "name")
      .populate("subCategory", "name")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const totalProducts = await Product.countDocuments({
      $text: { $search: q.trim() },
      isActive: true,
    });

    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        searchQuery: q.trim(),
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsBySubCategory,
  searchProducts,
};
