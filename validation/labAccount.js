/** @format */
const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId");

// Validate labName
const validateLabName = body("labName")
  .notEmpty()
  .withMessage("Lab name is required.")
  .bail()
  .isString()
  .trim()
  .escape()
  .isLength({ max: 150 })
  .withMessage("Lab name must not exceed 150 characters.");

// Validate labId - 6 digit number
const validateLabId = body("labId")
  .notEmpty()
  .withMessage("Lab ID is required.")
  .bail()
  .trim()
  .escape()
  .isInt({ min: 100000, max: 999999 })
  .withMessage("Lab ID must be a 6-digit number.");

// Validate address
const validateAddress = body("address")
  .notEmpty()
  .withMessage("Lab address is required.")
  .bail()
  .isString()
  .trim()
  .escape()
  .isLength({ max: 200 })
  .withMessage("Lab address must not exceed 200 characters.");

// Contact: required, exactly 11 numeric digits
const validateContact1 = body("contact1")
  .customSanitizer((value) => (value === null || value === undefined ? "" : value.toString()))
  .notEmpty()
  .trim()
  .escape()
  .withMessage("Contact Number is required.")
  .bail()
  .isNumeric()
  .withMessage("Contact must contain only numeric digits.")
  .bail()
  .isLength({ min: 11, max: 11 })
  .withMessage("Contact must contain exactly 11 numeric digits.");

// Contact: optional, but if provided must be exactly 11 numeric digits
const validateContact2 = body("contact2")
  .trim()
  .escape()
  .customSanitizer((value) => (value === null || value === undefined ? "" : value.toString()))
  .optional()
  .isNumeric()
  .withMessage("Contact must contain only numeric digits.")
  .bail()
  .isLength({ min: 11, max: 11 })
  .withMessage("Contact must contain exactly 11 numeric digits.");

// Email: required, must be valid email format
const validateEmail = body("email")
  .notEmpty()
  .trim()
  .escape()
  .withMessage("Email is required.")
  .bail()
  .isEmail()
  .withMessage("Please provide a valid email address.")
  .normalizeEmail();

// Active Status: required, must be boolean
const validateIsActive = body("isActive")
  .notEmpty()
  .withMessage("Active status is required.")
  .bail()
  .isBoolean()
  .withMessage("Active status must be either true or false.");


// Zone: required, must be a string
const validateZone = validateMongoId("zoneId", "Zone ID");

// Sub Zone: required, must be a string
const validateSubZone = validateMongoId("subZoneId", "Subzone ID");

const validateAddLabAccount = [
  validateLabName,
  validateLabId,
  validateAddress,
  validateContact1,
  validateContact2,
  validateEmail,
  validateZone,
  validateSubZone,
  validateIsActive,
];

const validateEditLabAccount = [validateMongoId("_id", "Lab id"), ...validateAddLabAccount];
const validateDeleteLabAccount = [validateMongoId("_id", "Lab ID")];

module.exports = {
  validateAddLabAccount,
  validateEditLabAccount,
  validateDeleteLabAccount,
};
