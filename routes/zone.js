const express = require("express");
const router = express.Router();
const zoneController = require("../controller/zone");
const { subZoneValidationRules, zoneValidationRules } = require("../validation/zone");
const { validateMongoId } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Add a new Zone
router.post("/add", zoneValidationRules, handleValidationErrors, zoneController.postZone);

// Get a zone
router.get("/", validateMongoId("zoneId", "Zone ID"), handleValidationErrors, zoneController.getZone);

// Get all zones
router.get("/all", zoneController.getAllZones);

// Update a zone
router.patch(
  "/edit",
  validateMongoId("zoneId", "Zone ID"),
  zoneValidationRules,
  handleValidationErrors,
  zoneController.patchZone
);

// Delete a zone
router.delete("/delete", validateMongoId("zoneId", "Zone ID"), handleValidationErrors, zoneController.deleteZone);

// Create a subzone
router.post("/subzone/add", subZoneValidationRules, handleValidationErrors, zoneController.postSubZone);

// Update a subzone
router.patch(
  "/subzone/edit",
  subZoneValidationRules,
  validateMongoId("subZoneId", "Sub Zone ID"),
  handleValidationErrors,
  zoneController.patchSubZone
);

// Delete a subzone
router.delete(
  "/subzone/delete",
  validateMongoId("zoneId", "Zone ID"),
  validateMongoId("subZoneId", "Sub Zone ID"),
  handleValidationErrors,
  zoneController.deleteSubZone
);

module.exports = router;
