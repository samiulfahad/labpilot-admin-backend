const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId");

// Validate testName
const validateTestName = body("testName")
  .notEmpty()
  .withMessage("Test name is required.")
  .isString()
  .trim()
  .toUpperCase()
  .isLength({ max: 70 })
  .withMessage("Test name must not exceed 70 characters.");

const validateIsOnline = body("isOnline")
  .notEmpty()
  .withMessage("Online status is required.")
  .bail()
  .isBoolean()
  .withMessage("Online status must be a boolean (true or false).")
  .toBoolean();

// Validate categoryName
const validateCatName = body("categoryName")
  .notEmpty()
  .withMessage("Category name is required.")
  .isString()
  .trim()
  .toUpperCase()
  .isLength({ max: 80 })
  .withMessage("Category name must not exceed 50 characters.");

const validatePOSTCat = [validateCatName];
const validatePATCHCat = [validateMongoId("categoryId", "Category ID"), ...validatePOSTCat];

const validatePOSTTest = [validateTestName, validateIsOnline, validateMongoId("categoryId", "Category ID")];
const validatePATCHTest = [validateMongoId("testId", "Test ID"), ...validatePOSTTest];

module.exports = { validatePOSTTest, validatePATCHTest, validatePOSTCat, validatePATCHCat };
