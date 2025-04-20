const express = require("express");
const router = express.Router();

const {
  getDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone
} = require("../controllers/deliveryZone");

// Delivery zone routes
router.route("/")
  .get(getDeliveryZones)      // Get delivery zones or check if postal code is serviceable
  .post(createDeliveryZone);  // Create new delivery zone

// Manage specific delivery zone
router.route("/:id")
  .put(updateDeliveryZone)    // Update delivery zone
  .delete(deleteDeliveryZone);// Delete delivery zone

module.exports = router;