const express = require("express");
const router = express.Router();
const {
  // Category endpoints
  createCategory,
  listTestsByCategory,
  listTests,
  updateCategory,
  deleteCategory,

  // Test endpoints
  createTest,
  updateTest,
  deleteTest,
} = require("../controller/labTest");

const { validateAddTest, validateAddCat, validateEditTest, validateEditCat } = require("../validation/labTest");
const handleValidationErrors = require("../validation/handleValidationErrors");
const { validateMongoId } = require("../validation/mongoId");

// Add a new Category
router.post("/category/add", validateAddCat, handleValidationErrors, createCategory);

// Get a Category with associated tests
router.get("/category", validateMongoId("categoryId", "Category ID"), handleValidationErrors, listTestsByCategory);

// Get all categories with associated tests
router.get("/category/all", listTests);

// Update a category
router.patch("/category/edit", validateEditCat, handleValidationErrors, updateCategory);

// Delete a category with all tests associated
router.delete("/category/delete", validateMongoId("categoryId", "Caegory ID"), handleValidationErrors, deleteCategory);

// Create a test
router.post("/add", validateAddTest, handleValidationErrors, createTest);

// Update a test
router.patch("/edit", validateEditTest, handleValidationErrors, updateTest);

// Delete a test
router.delete(
  "/delete",
  validateMongoId("testId", "Test ID"),
  validateMongoId("categoryId", "Category ID"),
  handleValidationErrors,
  deleteTest
);

module.exports = router;
