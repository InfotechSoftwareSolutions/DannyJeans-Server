const express = require("express")
const router = express.Router()

// Cart Management
router.post("cart/add", deleteCategory); //→ Add product to cart (user)
router.get("/", deleteCategory); //→ Get user's cart
router.put("/update/:id", deleteCategory); //→ Update cart item quantity
router.delete("/remove/:id", deleteCategory); //→ Remove product from cart
router.delete("/clear", deleteCategory); //→ Clear the cart


// router.post("/cart", addToCart);
// router.delete("/cart/:productId", removeFromCart);
// router.put("/cart/:productId", updateCartQuantity);
// router.get("/cart/:userId", getCart);

// router.post("/wishlist", addToWishlist);
// router.delete("/wishlist/:productId", removeFromWishlist);
// router.get("/wishlist/:userId", getWishlist);


module.exports = router; 