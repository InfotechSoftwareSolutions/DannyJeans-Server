const mongoose = require("mongoose");

const { Product } = require("../models/productModel");
const { Category } = require("../models/categoryModel");
const { User } = require("../models/userModel.js");

// ✅ Get All Products

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate(
      "category",
      "name description"
    ); // Populate category

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }

    const newArrivedProducts = [...products].reverse();
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
      newArrivedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the products.",
      error: error.message,
    });
  }
};

const getAllProducts = async (res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }
    return products;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the products.",
      error: error.message,
    });
  }
};

const getCartSingleItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const user = await User.findOne(
      { _id: userId, "cart.product": id },
      { "cart.$": 1 } // Only return the matching cart item
    ).populate("cart.product");

    if (!user || !user.cart.length) {
      return {
        success: false,
        message: "Product not found in the cart",
      };
    }
    const product = user.cart[0];

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      product,
    });
  } catch (error) {
    console.error("Error fetching cart item:", error);
    throw error;
  }
};

const getFilterProducts = async (req, res) => {
  try {
    //const { categoryId } = req.query; // Extract category ID from query params
    const { id } = req.params; // Extract category ID from query params
    console.log(req.params, "req.params");
    // console.log("categoryId",categoryId);
    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const product = await Product.find({ category: id }).populate("category"); // Fetch products with category details
    // Validation: Check if products exist
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "No products found. Please add products first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const getProducts = async (req, res) => {
//     try {
//         const product = await Product.find();

//         // Validation: Check if products exist
//         if (!product) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No products found. Please add products first.",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Products retrieved successfully.",
//             data: product,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while retrieving the products.",
//             error: error.message,
//         });
//     }
// };

// ✅ Get Single product
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the product.",
      error: error.message,
    });
  }
};

//✅ Add a new product

const addProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      product_price,
      sale_price,
      offer,
      category,
      stock,
    } = req.body;

    // Parse and validate the variant
    let variant = [];
    if (req.body.variant) {
      try {
        variant = JSON.parse(req.body.variant);
        if (!Array.isArray(variant)) {
          return res
            .status(400)
            .json({ message: "Invalid variant format. Must be an array." });
        }
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid variant JSON format." });
      }
    }

    // Convert numeric fields from string to number
    product_price = Number(product_price);
    sale_price = sale_price ? Number(sale_price) : 0;
    stock = Number(stock);

    // Validate required fields
    if (
      !name ||
      !description ||
      !product_price ||
      !category ||
      stock === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID." });
    }

    // Handle image uploads (assuming Cloudinary or other storage service)
    const imageUrls = req.files.map((file) => file.path); // Modify this to match your storage logic

    // Check if the product already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product already exists." });
    }

    // Create a new product with variants
    const product = await Product.create({
      name,
      description,
      sale_price,
      product_price,
      category,
      stock,
      images: imageUrls,
      variant, // Save parsed variant data
    });

    if (!product) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product creation failed. Try again.",
        });
    }

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

// ✅ Update Product
const updateProduct = async (req, res) => {
  try {
    console.log("updateProduct");
    const { id } = req.params;
    console.log(req.params, " req.params");
    const { name, description, price, category, stock, images } = req.body;
    console.log(
      name,
      description,
      price,
      category,
      stock,
      images,
      "name, description, price, category, stock, images"
    );
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images || product.images;

    const updatedProduct = await product.save();

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product update failed. Please try again.",
      });
    }

    const products = await getAllProducts(res);
    if (!Array.isArray(products)) return; // Prevent further execution if an error response is already sent

    res.json({
      success: true,
      message: "Product updated successfully!",
      products,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
};

// ✅ Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const deletedProduct = await product.deleteOne();

    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete the product. Please try again.",
      });
    }

    const products = await getAllProducts(res);
    if (!Array.isArray(products)) return; // Prevent further execution if an error response is already sent

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product.",
      error: error.message,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const productsByCategory = await Category.aggregate([
      {
        $lookup: {
          from: "products", // Collection name should match in MongoDB
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          name: 1, // Category name
          description: 1,
          offer_price: 1,
          isActive: 1,
          products: 1, // Include all products in that category
        },
      },
    ]);
    console.log(getProductsByCategory, "====getProductsByCategory");

    res.status(200).json(productsByCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   const toggleProductStatus = async (req, res) => {
//     try {
//         console.log("toggleProductStatus");

//         const {id: productId } = req.params;
// console.log(productId,"productId");
//         // Validate productId
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid product ID.",
//             });
//         }

//         // Aggregation pipeline to toggle isActive status
//         const updatedProduct = await Product.aggregate([
//             { $match: { _id: new mongoose.Types.ObjectId(productId) } }, // Find product by ID
//             {
//                 $set: { isActive: { $not: ["$isActive"] } } // Toggle isActive field
//             },
//             {
//                 $merge: {
//                     into: "products", // Update the existing document
//                     whenMatched: "merge",
//                     whenNotMatched: "discard"
//                 }
//             },
//             { $match: { _id: new mongoose.Types.ObjectId(productId) } }, // Fetch the updated document
//         ]);

//         if (updatedProduct.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Product not found.",
//             });
//         }

//         const products = await getAllProducts(res);
//         if (!Array.isArray(products)) return; // Prevent further execution if an error response is already sent

//         res.status(200).json({
//             success: true,
//             message: `Product ${updatedProduct[0].isActive ? "unblocked" : "blocked"} successfully.`,
//             product: products,
//         });

//     } catch (error) {
//         console.error("Error toggling product status:", error);
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while updating the product status.",
//             error: error.message,
//         });
//     }
// };

const toggleProductStatus = async (req, res) => {
  try {
    console.log("toggleProductStatus");

    const { id: productId } = req.params;
    console.log(productId, "productId");

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Find the product and toggle isActive
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.isActive = !product.isActive; // Toggle isActive
    await product.save(); // Save the updated product

    const products = await getAllProducts(res);
    if (!Array.isArray(products)) return;

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive ? "unblocked" : "blocked"
      } successfully.`,
      product: products,
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the product status.",
      error: error.message,
    });
  }
};
const getTrendingProducts = async (req, res) => {
  try {
    // Find products by category and trending status
    const products = await Product.find({ trending: true }).populate(
      "category",
      "name description"
    ); // Populate category
    console.log(products, "products");

    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No trending products found in this category.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trending products retrieved successfully.",
      products,
    });
  } catch (error) {
    log.error("Error fetching trending products:", error);
    res.status(500).json({ message: error.message });
  }
};

const getTodayOffersProducts = async (req, res) => {
  try {
    // Find products by category and trending status
    const products = await Product.find({ today_offer: true }).populate(
      "category",
      "name description"
    ); // Populate category

    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No trending products found in this category.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trending products retrieved successfully.",
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getCartSingleItem,
  getFilterProducts,
  toggleProductStatus,
  getTrendingProducts,
  getTodayOffersProducts,
};
