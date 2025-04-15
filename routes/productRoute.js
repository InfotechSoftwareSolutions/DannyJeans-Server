const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { upload } = require("../uploads/multer"); // Import your multer config
const { checkAuth } = require("../middlewares/checkAuth");
// const { checkAuth } = require("../middlewares/checkAuth");


function checkAuthww(req, res, next) {
  
    console.log("checkAuthww");
    
}
// Product Management
//router.get("/",productController.getProductsByCategory);//→ Get all products
router.get("/",productController.getProducts);//→ Get all products 
router.get("/in-cart/:id",checkAuth,productController.getCartSingleItem);//→ Get all products 
router.get("/:id",productController.getSingleProduct);//→ Get a single product by ID
router.post("/admin",upload.array("images", 5), productController.addProduct); //→ Create a new product (admin)
router.put("/admin/:id", productController.updateProduct ); //→ Update a product (admin)
router.delete("/admin/:id", productController.deleteProduct); //→ Delete a product (admin)
router.get("/filter/:id",productController.getFilterProducts);//→ Get all products
router.put("/admin/toggle-status/:id", productController.toggleProductStatus ); //→ Update a product (admin)



module.exports = router; 