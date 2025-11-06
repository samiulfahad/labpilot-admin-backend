const express = require("express");
const router = express.Router();
const {
  createAdmin,
  deactivateAdmin,
  activateAdmin,
  listAdmins,
  deleteAdmin,
  createSupportAdmin,
  deactivateSupportAdmin,
  activateSupportAdmin,
} = require("../controller/labAdmin");

// Create admin
router.post("/add", createAdmin);

// Deactivate admin
router.patch("/deactivate", deactivateAdmin);

// Activate admin
router.patch("/activate", activateAdmin);

// Get all admins
router.get("/all", listAdmins);

// Get all admins
router.delete("/delete", deleteAdmin);

// Add Support Admin
router.post("/add/supportAdmin", createSupportAdmin);

// Deactivate Support Admin
router.patch("/deactivate/supportAdmin", deactivateSupportAdmin);

// Activate Support Admin
router.patch("/activate/supportAdmin", activateSupportAdmin);

module.exports = router;
