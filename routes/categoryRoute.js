const express = require("express")
const router = express.Router()
const categoryController = require("../controllers/categoryController")
const { checkAuth } = require("../middlewares/checkAuth");

// Category Management
router.get("/",categoryController.getCategories);//→ Get category
router.get("/all",categoryController.allCategories);//→ Get all category
router.get("/:id",categoryController.getSingleCategory);//→ Get a single category by ID
router.post("/admin",checkAuth, categoryController.addCategory); //→ Create a new category (admin)
router.put("/admin/:id",checkAuth, categoryController.updateCategory ); //→ Update a category (admin)
router.put("/admin/toggle-status/:id",checkAuth, categoryController.toggleCategoryStatus ); //→ Update a category (admin)
router.delete("/admin/:id",checkAuth, categoryController.deleteCategory); //→ Delete a category (admin)


module.exports = router; 