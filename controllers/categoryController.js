const mongoose = require("mongoose");
// const { Category } = require("../models/productModel");
const { Category } = require("../models/categoryModel");



// ✅ Get All Categories
const getAllCategories = async (res) => {
    try {
        const categories = await Category.find();
        if (!categories) {
            return res.status(400).json({
                success: false,
                message: "No categories found. Please add categories first.",
            });
        }
        return categories;
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the categories.",
            error: error.message,
        });
    }
};

// ✅ Get All Categories
const allCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        // Validation: Check if categories exist
        if (!categories) {
            return res.status(400).json({
                success: false,
                message: "No categories found. Please add categories first.",
            });
        }

        res.status(200).json({
            success: true,
            message: "categories retrieved successfully.",
            categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the categories.",
            error: error.message,
        });
    }
};

// ✅ Get Categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });

        // Validation: Check if categories exist
        if (!categories) {
            return res.status(400).json({
                success: false,
                message: "No categories found. Please add categories first.",
            });
        }

        res.status(200).json({
            success: true,
            message: "categories retrieved successfully.",
            categories,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the categories.",
            error: error.message,
        });
    }
};

// ✅ Get Single Category
const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if ID is provided
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "category not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "category retrieved successfully.",
            category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the category.",
            error: error.message,
        });
    }
};

// ✅ Add New Category
const addCategory = async (req, res) => {
    try {
        console.log("====addCategory");
        
        const { name, description, parentCategory, offer_price, isActive } = req.body;
        if(parentCategory) console.log(parentCategory,"=====parentCategory");

console.log(name, description, parentCategory, offer_price, isActive ,"=====Allll");

        // Check if required fields are present
        if (!name) {
            return res.status(400).json({ message: "Category name is required." });
        }

        // Validate data types
        if (typeof name !== "string") {
            return res.status(400).json({ message: "Invalid type: name must be a string." });
        }

        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({ message: "Invalid type: description must be a string." });
        }

        if (offer_price !== undefined && typeof offer_price !== "number") {
            return res.status(400).json({ message: "Invalid type: offer_price must be a number." });
        }

        // if (parentCategory !== null && !mongoose.Types.ObjectId.isValid(parentCategory)) {
        //     return res.status(400).json({ message: "Invalid type: parentCategory must be a valid ObjectId." });
        // }

        if (parentCategory) {
            console.log("inside parentCategory");  
            
            if(!mongoose.Types.ObjectId.isValid(parentCategory))res.status(400).json({ message: "Invalid type: parentCategory must be a valid ObjectId." });
        }

        if (isActive !== undefined && typeof isActive !== "boolean") {
            return res.status(400).json({ message: "Invalid type: isActive must be a boolean." });
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists." });
        }

        const category = await Category.create({
            name,
            description,
            parentCategory: parentCategory || null,
        });

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "category creation failed. Please try again.",
            });
        }

        const categories = await Category.find();

        // Validation: Check if categories exist
        if (!categories) {
            return res.status(400).json({
                success: false,
                message: "No categories found. Please add categories first.",
            });
        }

        res.status(201).json({
            success: true,
            message: "Category added successfully!",
            categories,
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the category.",
            error: error.message,
        });
    }
};
// ✅ Update Category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        // *********************
        // const { name, description, parentCategory, isActive } = req.body;

        // Validation
        // if (!name || !description || !parentCategory) {
        //     return res.status(400).json({ success: false, message: "All fields are required." });
        // }
        // *********************

        const { name, description, parentCategory, offer_price, isActive } = req.body;   

        // Check if required fields are present
        if (!name) {
            return res.status(400).json({ message: "Category name is required." });
        }

        // Validate data types
        if (typeof name !== "string") {
            return res.status(400).json({ message: "Invalid type: name must be a string." });
        }

        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({ message: "Invalid type: description must be a string." });
        }

        if (offer_price !== undefined && typeof offer_price !== "number") {
            return res.status(400).json({ message: "Invalid type: offer_price must be a number." });
        }

        // if (parentCategory !== undefined && !mongoose.Types.ObjectId.isValid(parentCategory)) {
        //     return res.status(400).json({ message: "Invalid type: parentCategory must be a valid ObjectId." });
        // }

        if (parentCategory) { 
    
            if(!mongoose.Types.ObjectId.isValid(parentCategory))res.status(400).json({ message: "Invalid type: parentCategory must be a valid ObjectId." });
        }

        if (isActive !== undefined && typeof isActive !== "boolean") {
            return res.status(400).json({ message: "Invalid type: isActive must be a boolean." });
        }

        const category = await Category.findById(id);

        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        category.name = name || category.name;
        category.description = description || category.description;
        category.parentCategory = parentCategory || category.parentCategory;
        category.isActive = isActive !== undefined ? isActive : category.isActive;

        const updatedCategory = await category.save();

        if (!updatedCategory) {
            return res.status(400).json({
                success: false,
                message: "Category update failed. Please try again.",
            });
        }

        const categories = await Category.find();

        // Validation: Check if categories exist
        if (!categories) {
            return res.status(400).json({
                success: false,
                message: "No categories found. Please add categories first.",
            });
        }

        res.json({
            success: true,
            message: "Category updated successfully!",
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the category.",
            error: error.message,
        });
    }
};

// ✅ Delete Category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required.",
            });
        }

        const category = await Category.findById(id);

        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const deletedCategory = await category.deleteOne();

        if (!deletedCategory) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete the product. Please try again.",
            });
        }
        res.status(200).json({ success: true, message: "Category deleted successfully!" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the category.",
            error: error.message,
        });
    }
};

// const toggleCategoryStatus = async (req, res) => {
//     try {
//         const { categoryId } = req.params;

//         // Ensure categoryId is a valid ObjectId
//         if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid category ID.",
//             });
//         }

//         // Aggregation pipeline to toggle isActive status
//         const updatedCategory = await Category.aggregate([
//             { $match: { _id: new mongoose.Types.ObjectId(categoryId) } }, // Find category by ID
//             { 
//                 $set: { isActive: { $not: ["$isActive"] } } // Toggle isActive field
//             },
//             {
//                 $merge: {
//                     into: "categories", // Update the existing document
//                     whenMatched: "merge", 
//                     whenNotMatched: "discard"
//                 }
//             },
//             { $match: { _id: new mongoose.Types.ObjectId(categoryId) } }, // Fetch the updated document
//         ]);

//         if (updatedCategory.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Category not found.",
//             });
//         }

//         const categories = await getAllCategories(res);
//         if (!Array.isArray(categories)) return; // Prevent further execution if an error response is already sent


//         res.status(200).json({
//             success: true,
//             message: Category ${updatedCategory[0].isActive ? "unblocked" : "blocked"} successfully.,
//             categories
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while updating the category status.",
//             error: error.message,
//         });
//     }
// };

const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate categoryId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID.",
            });
        }

        // Find the category and toggle isActive
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        category.isActive = !category.isActive; // Toggle isActive
        await category.save(); // Save the updated category

        const categories = await getAllCategories(res);
        if (!Array.isArray(categories)) return;

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? "unblocked" : "blocked"} successfully.`,
            categories,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the category status.",
            error: error.message,
        });
    }
};


module.exports = { getCategories, allCategories, getSingleCategory, addCategory, updateCategory, deleteCategory,toggleCategoryStatus };
