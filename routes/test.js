const express = require("express");
const router = express.Router();
const testController = require("../controller/test");
const { validatePOSTTest, validatePATCHTest } = require("../validation/test");
const { validateMongoId, validateMongoIdIfProvided } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Create a new test
router.post("/add", validatePOSTTest, handleValidationErrors, testController.postTest);

// Get all tests
router.get(
  "/all",
  validateMongoIdIfProvided("categoryId", "Category ID"),
  handleValidationErrors,
  testController.getAllTests
);

// Update a test
router.patch("/edit", validatePATCHTest, handleValidationErrors, testController.patchTest);

// Delete a test
router.delete("/delete", validateMongoId("_id", "Test ID"), handleValidationErrors, testController.deleteTest);

module.exports = router;
