const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId");

// Validate categoryName
const validateCatName = body("categoryName")
  .notEmpty()
  .withMessage("Category name is required.")
  .isString()
  .trim()
  .toUpperCase()
  .isLength({ max: 50 })
  .withMessage("Category name must not exceed 50 characters.");

const validatePOSTCat = [validateCatName];
const validatePATCHCat = [validateMongoId("_id", "Category ID"), ...validatePOSTCat];

module.exports = { validatePOSTCat, validatePATCHCat };
