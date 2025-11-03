const express = require("express");
const router = express.Router();
const testController = require("../controller/test");

const { validatePOSTTest, validatePOSTCat, validatePATCHTest, validatePATCHCat } = require("../validation/test");
const handleValidationErrors = require("../validation/handleValidationErrors");
const { validateMongoId } = require("../validation/mongoId");

// Add a new Category
router.post("/category/add", validatePOSTCat, handleValidationErrors, testController.postCategory);

// Get a Category
router.get(
  "/category",
  validateMongoId("categoryId", "Category ID"),
  handleValidationErrors,
  testController.getTestsByCategory
);

// Get all categories
router.get("/category/all", testController.getAllTestsWithCategories);

// Update a category
router.patch("/category/edit", validatePATCHCat, handleValidationErrors, testController.patchCategory);

// Delete a category with all tests associated
router.delete(
  "/category/delete",
  validateMongoId("categoryId", "Caegory ID"),
  handleValidationErrors,
  testController.deleteCategory
);

// Create a test
router.post("/add", validatePOSTTest, handleValidationErrors, testController.postTest);

// Update a test
router.patch("/edit", validatePATCHTest, handleValidationErrors, testController.patchTest);

// Delete a test
router.delete(
  "/delete",
  validateMongoId("testId", "Test ID"),
  validateMongoId("categoryId", "Category ID"),
  handleValidationErrors,
  testController.deleteTest
);

module.exports = router;
