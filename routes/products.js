const express = require("express");

const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
  getManufacturers,
} = require("../controllers/products");

router.route("/").get(getAllProducts).post(createProduct);
router.route("/search").get(searchProducts);

router.route("/manufacturers").get(getManufacturers);
router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
