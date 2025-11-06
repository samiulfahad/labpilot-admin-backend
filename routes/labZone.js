const express = require("express");
const router = express.Router();
const {
  // Zone endpoints
  createZone,
  getZone,
  listZones,
  updateZone,
  deleteZone,

  // SubZone endpoints
  createSubZone,
  updateSubZone,
  deleteSubZone,
} = require("../controller/labZone");
const {
  validateGetZone,
  validateAddZone,
  validateEditZone,
  validateDeleteZone,
  validateAddSubZone,
  validateEditSubZone,
  validateDeleteSubZone,
} = require("../validation/labZone");
const { validateMongoId } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Add a new Zone
router.post("/add", validateAddZone, handleValidationErrors, createZone);

// Get a zone
router.get("/", validateGetZone, handleValidationErrors, getZone);

// Get all zones
router.get("/all", listZones);

// Edit zone
router.patch("/edit", validateEditZone, handleValidationErrors, updateZone);

// Delete zone
router.delete("/delete", validateDeleteZone, handleValidationErrors, deleteZone);

// Add a subzone
router.post("/subzone/add", validateAddSubZone, handleValidationErrors, createSubZone);

// Edit a subzone
router.patch("/subzone/edit", validateEditSubZone, handleValidationErrors, updateSubZone);

// Delete a subzone
router.delete("/subzone/delete", validateDeleteSubZone, handleValidationErrors, deleteSubZone);

module.exports = router;
