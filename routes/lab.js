const express = require("express");
const router = express.Router();
const labController = require("../controller/lab");
const { labValidationRules, validateLabId } = require("../validation/lab");
const { searchLabValidationRules } = require("../validation/searchLab");
const { validateMongoId } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Create a new lab
router.post("/add", labValidationRules, handleValidationErrors, labController.postLab);

// Get lab/s (Search by LabId, email, contact, zoneId, subZoneId)
router.get("/search", searchLabValidationRules, handleValidationErrors, labController.getLab);

// Get all labs
router.get("/all", labController.getAllLabs);

// Update lab data
router.patch(
  "/edit",
  labValidationRules,
  validateMongoId("_id", "lab ID"),
  handleValidationErrors,
  labController.patchLab
);

// Delete a lab permanently
router.delete("/delete", validateMongoId("_id", "Lab ID"), handleValidationErrors, labController.deleteLab);

module.exports = router;
