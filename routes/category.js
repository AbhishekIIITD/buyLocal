const express = require("express");
const router = express.Router();

const {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryIdByUsage,
} = require("../controllers/category");

// Add new route for getting category by usage
router.route("/by-usage").get(getCategoryIdByUsage);

router.route("/").get(getAllCategories).post(createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);



module.exports = router;