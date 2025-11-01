const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId");

// Validate testName
const validateTestName = body("testName")
  .notEmpty()
  .withMessage("Test name is required.")
  .isString()
  .trim()
  .customSanitizer((value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  .isLength({ max: 70 })
  .withMessage("Test name must not exceed 70 characters.");

const validateIsOnline = body("isOnline")
  .notEmpty()
  .withMessage("Online status is required.")
  .bail()
  .isBoolean()
  .withMessage("Online status must be a boolean (true or false).")
  .toBoolean();

const validatePOSTTest = [validateTestName, validateIsOnline, validateMongoId("categoryId", "Category ID")];
const validatePATCHTest = [validateMongoId("_id", "Test ID"), ...validatePOSTTest];

module.exports = { validatePOSTTest, validatePATCHTest };
