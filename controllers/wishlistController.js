// import { User } from "../models/userModel";
const { User } = require("../models/userModel.js");
// const { Product } = require("../models/productModel.js");

// 📌 Get Wishlist Items
const getWishlist = async (req, res) => {
  try {

    const  userId  = req.userId;
    // Handle missing userId in params
    if (!userId) {
      return res.status(400).json({success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId).populate("wishlist");
    if (!user) return res.status(404).json({success: false, message: "User not found" });

    res.status(200).json({success: true, wishlist: user.wishlist });

  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};


// 📌 Add to Wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const  userId  = req.userId;

    if (!userId || !productId) {
      return res.status(400).json({success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({success: false, message: "User not found" });

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({success: false, message: "Item already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({success: true, message: "Item added to wishlist", success:true});

  } catch (error) {
    res.status(500).json({success: false, message: error.message });
  }
};

// 📌 Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    // const { userId } = req.body;
    const  userId  = req.userId;
    const { productId } = req.params;
    // Handle missing productId in params
    if (!productId) {
      return res.status(400).json({success: false, message: "product ID is required" });
    }

    // Check if both userId and productId are provided
    if (!userId || !productId) {
      return res.status(400).json({success: false, message: "User ID and Product ID are required" });
    }
    // Use $pull to remove the product directly from the wishlist array
    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { wishlist: productId } }, // Removes the product from the wishlist array
      { new: true } // Returns the updated document
    );

    if (!result) {
      return res.status(404).json({success: false, message: "User not found or product not in wishlist" });
    }

    const updatedUser = await User.findById(userId).populate("wishlist");
    if (!updatedUser) return res.status(404).json({success: false, message: "User not found" });

    res.status(200).json({success: true, message: "Item removed from wishlist", wishlist: updatedUser.wishlist });

  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({success: false, message: error.message });
  }
};


module.exports = {addToWishlist, removeFromWishlist, getWishlist };