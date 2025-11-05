const express = require("express");
const router = express.Router();
const labAdmin = require("../controller/labAdmin");

// Create admin
router.post("/add", labAdmin.postAdmin);

// Deactivate admin
router.patch("/deactivate", labAdmin.deactivateAdmin);

// Activate admin
router.patch("/activate", labAdmin.activateAdmin);

// Get all admins
router.get("/all", labAdmin.getAllAdmins);

// Get all admins
router.delete("/delete", labAdmin.deleteAdmin);

module.exports = router;
