const express = require("express");
const {
  createPC,
  getAllPCs,
  getPC,
  updatePC,
  deletePC,
  getPcByUsage,
} = require("../controllers/pc");

const router = express.Router();

router.get('/usage/:usage', getPcByUsage);
router.post("/", createPC);
router.get("/", getAllPCs);
router.get("/:id", getPC);
router.put("/:id", updatePC);
router.delete("/:id", deletePC);

module.exports = router;
