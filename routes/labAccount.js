const express = require("express");
const router = express.Router();
const { validateAddLabAccount, validateEditLabAccount, validateDeleteLabAccount } = require("../validation/labAccount");
const { createLab, searchLab, listLabs, updateLab, deleteLab } = require("../controller/labAccount");
const { validateSearchLab } = require("../validation/labAccountSearch");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Create a new lab
router.post("/add", validateAddLabAccount, handleValidationErrors, createLab);

// Get lab/s (Search by LabId, email, contact, zoneId, subZoneId)
router.get("/search", validateSearchLab, handleValidationErrors, searchLab);

// Get all labs
router.get("/all", listLabs);

// Update lab data
router.patch("/edit", validateEditLabAccount, handleValidationErrors, updateLab);

// Delete a lab permanently
router.delete("/delete", validateDeleteLabAccount, handleValidationErrors, deleteLab);

module.exports = router;
