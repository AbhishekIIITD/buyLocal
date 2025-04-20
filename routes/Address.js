const express = require("express");
const router = express.Router();

const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require("../controllers/Address");

// Address routes
router.route("/")
  .get(getUserAddresses)  // Get user's addresses
  .post(createAddress);   // Create new address

// Manage specific address
router.route("/:id")
  .put(updateAddress)     // Update address
  .delete(deleteAddress); // Delete address

module.exports = router;