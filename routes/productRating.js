const express = require("express");
const router = express.Router();

const {
  getProductRatings,
  createProductRating,
  updateProductRating,
  deleteProductRating
} = require("../controllers/productRating");

// Get ratings for a specific product
router.route("/product/:productId").get(getProductRatings);

// Create new rating
router.route("/").post(createProductRating);

// Manage specific rating
router.route("/:id")
  .put(updateProductRating)    // Update rating
  .delete(deleteProductRating);// Delete rating

module.exports = router;