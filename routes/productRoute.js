const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { upload } = require("../uploads/multer"); // Import your multer config
const { checkAuth } = require("../middlewares/checkAuth");


// Product Management
<<<<<<< HEAD
//router.get("/",productController.getProductsByCategory);//→ Get all products
router.get("/trending",productController.getTrendingProducts);//→ Get a single product by ID
router.get("/today-offers",productController.getTodayOffersProducts);//→ Get a single product by ID
router.get("/",productController.getProducts);//→ Get all products 
router.get("/in-cart/:id",checkAuth,productController.getCartSingleItem);//→ Get all products 
router.get("/:id",productController.getSingleProduct);//→ Get a single product by ID
=======

router.get("/",productController.getProducts);//→ Get products 
router.get("/all",productController.allProducts);//→ Get all products 
router.get("/in-cart/:productId",checkAuth,productController.getCartSingleItem);//→ Get all products 
router.get("/:productId",productController.getSingleProduct);//→ Get a single product by ID
router.get("/trending",productController.getTrendingProducts);//→ Get a single product by ID
router.get("/today-offers",productController.getTodayOffersProducts);//→ Get a single product by ID
>>>>>>> 1e29eb9e2b089ad15e68569191c92f4f51939c1d
router.post("/admin",upload.array("images", 5), productController.addProduct); //→ Create a new product (admin)
router.put("/admin/:productId", productController.updateProduct ); //→ Update a product (admin)
router.delete("/admin/:productId", productController.deleteProduct); //→ Delete a product (admin)
router.get("/filter/:categoryId",productController.getFilterProducts);//→ Get all products
router.put("/admin/toggle-status/:productId", productController.toggleProductStatus ); //→ Update a product (admin)



module.exports = router; 