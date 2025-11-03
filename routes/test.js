const express = require("express");
const router = express.Router();
const testController = require("../controller/test");

const { subZoneValidationRules, zoneValidationRules } = require("../validation/zone");
const { validateMongoId } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Add a new Category
router.post("/category/add", testController.postCategory);

// Get a Category
router.get("/category", testController.getTestsByCategory);

// Get all categories
router.get("/category/all", testController.getAllTestsWithCategories);

// Update a category
router.patch("/category/edit", testController.patchCategory);

// Delete a category with all tests associated
router.delete("/category/delete", testController.deleteCategory);

// Create a test
router.post("/add", testController.postTest);

// Update a test
router.patch("/edit", testController.patchTest);

// Delete a test
router.delete("/delete", testController.deleteTest);

module.exports = router;
