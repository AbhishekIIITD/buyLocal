const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../controllers/cart");

// Clear entire cart (should be before /:cartItemId to avoid conflicts)
router.route("/clear").post(clearCart);

// Cart routes
router.route("/")
  .get(getCart)          // Get user's cart
  .post(addToCart);      // Add item to cart

// Update cart item quantity
router.route("/update").patch(updateCartItem);

// Remove specific item from cart
router.route("/:cartItemId").delete(removeFromCart);

module.exports = router;