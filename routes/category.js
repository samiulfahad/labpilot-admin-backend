const express = require("express");
const router = express.Router();
const catController = require("../controller/category");
const { validatePOSTCat, validatePATCHCat } = require("../validation/category");
const { validateMongoId } = require("../validation/mongoId");
const handleValidationErrors = require("../validation/handleValidationErrors");

// Add a category
router.post("/add", validatePOSTCat, handleValidationErrors, catController.postCategory);

// Get all categories
router.get("/all", catController.getAllCategories);

// Edit a category
router.patch("/edit", validatePATCHCat, handleValidationErrors, catController.patchCategory);

// Delete a category
router.delete("/delete", validateMongoId("_id", "Category ID"), handleValidationErrors, catController.deleteCategory);

module.exports = router;
