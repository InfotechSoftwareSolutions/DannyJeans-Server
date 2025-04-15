const express = require("express")
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()
const orderControllers = require("../controllers/orderControllers")

function abc(req,res,next){
    console.log("haiii");
    
}

// Order Management
router.get("/", orderControllers.getAllOrder); //→ Get user's orders
router.get("/single-user",checkAuth, orderControllers.getAllOrdersByUser); //→ Get single order details by user
router.get("/weekly-orders",checkAuth, orderControllers.orderForGraph); //→ Get single order details by user
router.get("/sales-by-category",checkAuth, orderControllers.salesByCategory); //→ Get single order details by user
//router.get("/:id", orderControllers); //→ Get single order details
router.get("/check-cart", checkAuth, orderControllers.isproductAvailabe); //→ Get user's orders
router.post("/", checkAuth, orderControllers.createOrder); //→ Get user's orders
router.put("/delivery-status/:orderId",orderControllers.orderStatusUpdate); //→ Update order status (admin)
router.put("/return/:orderId",orderControllers.processReturn); //→ Update order status (admin)
//router.get("/admin", orderControllers); //→ Get all orders (admin)
//router.post("/", orderControllers.createOrder); //→ Create a new order (user)
//router.put("/admin/:id", orderControllers); //→ Update order status (admin)


module.exports = router; 