const express = require("express")
const registerAndLogin = require("../controllers/register-login/registerAndLogin")
const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const wishlistController = require("../controllers/wishlistController")
const { checkAuth } = require("../middlewares/checkAuth");

const router = express.Router()

router.post("/signup", registerAndLogin.signup);
router.post("/login",registerAndLogin.login);

// User Management
router.get("/", userController.getUser);
router.put("/admin/toggle-status/:userId", userController.toggleUserStatus ); //→ Update a category (admin)
router.get("/detail",checkAuth, userController.getUserById);
router.put("/detail",checkAuth, userController.getUserById);

// Cart Management
router.get("/cart",checkAuth, cartController.getCart);
router.post("/cart", checkAuth, cartController.addToCart);
router.put("/cart/:productId",  checkAuth,  cartController.updateCartQuantity);
router.delete("/cart/:productId",  checkAuth, cartController.removeFromCart);

// Wishlist Management
router.get("/wishlist", checkAuth, wishlistController.getWishlist);
router.post("/wishlist", checkAuth, wishlistController.addToWishlist);
router.delete("/wishlist/:productId",checkAuth, wishlistController.removeFromWishlist);

module.exports = router;