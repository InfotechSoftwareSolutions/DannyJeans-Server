const express = require("express")
// const { upload } = require("../uploads/multer");
const registerAndLogin = require("../controllers/register-login/registerAndLogin")
// const courseControllers = require("../controllers/user/courseControllers")
const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const wishlistController = require("../controllers/wishlistController")
// const { checkAuth } = require("../middleware/checkAuth");
const { checkAuth } = require("../middlewares/checkAuth");
const router = express.Router()

// router.get("/home", courseControllers.home);

// Cart Management
// router.post("cart/add", deleteCategory); //→ Add product to cart (user)
// router.get("/", deleteCategory); //→ Get user's cart
// router.put("/update/:id", deleteCategory); //→ Update cart item quantity
// router.delete("/remove/:id", deleteCategory); //→ Remove product from cart
// router.delete("/clear", deleteCategory); //→ Clear the cart 

router.post("/signup", registerAndLogin.signup);
router.post("/login",registerAndLogin.login);

// Cart Management
router.get("/cart",checkAuth, cartController.getCart);
router.post("/cart", checkAuth, cartController.addToCart);
router.put("/cart/:productId",  checkAuth,  cartController.updateCartQuantity);
router.delete("/cart/:productId",  checkAuth, cartController.removeFromCart);

// Wishlist Management
router.get("/wishlist", checkAuth, wishlistController.getWishlist);
router.post("/wishlist", checkAuth, wishlistController.addToWishlist);
router.delete("/wishlist/:productId",checkAuth, wishlistController.removeFromWishlist);
router.get("/", userController.getUser);
router.put("/admin/toggle-status/:id", userController.toggleUserStatus ); //→ Update a category (admin)
router.get("/detail",checkAuth, userController.getUserById);
router.put("/detail",checkAuth, userController.getUserById);
// Product Management







module.exports = router;