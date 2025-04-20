const express = require("express");
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/wishlist");

// Wishlist routes
router.route("/")
  .get(getWishlist)      // Get user's wishlist
  .post(addToWishlist);  // Add item to wishlist

// Remove item from wishlist
router.route("/:wishlistId").delete(removeFromWishlist);

module.exports = router;