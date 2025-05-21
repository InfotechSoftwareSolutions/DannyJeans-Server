const mongoose = require("mongoose");
const { User } = require("../models/userModel.js");
const { Product } = require("../models/productModel.js");


// ✅ Get All Users
const getAllusers = async (res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "No users found. Please add users first.",
      });
    }
    return users;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the users.",
      error: error.message,
    });
  }
};


// ✅ Get Users
const getUser = async (req, res) => {
  try {

    const users = await User.find({ role: { $ne: "admin" } }); // Exclude admins

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};

// ✅ update toggle status
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

        // Check if userId is provided
        if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Find the category and toggle isActive
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    user.isActive = !user.isActive; // Toggle isActive
    await user.save(); // Save the updated category

    const users = await getAllusers(res);
    if (!Array.isArray(users)) return;

    res.status(200).json({
      success: true,
      message: `User updated Successfully.`,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status.",
      error: error.message,
    });
  }
};

// ✅ Get user by id
const getUserById = async (req, res) => {
  try {

    const userId = req.userId; // Assuming extracted from auth middleware

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required."
      });
    }

    // Find the user first
    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const user = {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      image: userData?.image,
    }
    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};



module.exports = {
  getUser,
  toggleUserStatus,
  getUserById
};
