/** @format */
const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId");

// Validate zoneName
const validateZoneName = body("zoneName")
  .notEmpty()
  .withMessage("Zone name is required.")
  .bail()
  .isString()
  .trim()
  .escape()
  .toUpperCase()
  .isLength({ max: 30 })
  .withMessage("Zone name must not exceed 150 characters.");

// Validate subZoneName
const validateSubZoneName = body("subZoneName")
  .notEmpty()
  .withMessage("Sub Zone name is required.")
  .bail()
  .isString()
  .trim()
  .escape()
  .customSanitizer((value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  .isLength({ max: 20 })
  .withMessage("Subzone name must not exceed 150 characters.");

const validateGetZone = [validateMongoId("zoneId", "Zone ID")];
const validateAddZone = [validateZoneName];
const validateEditZone = [validateMongoId("zoneId", "Zone ID"), ...validateAddZone];

const validateAddSubZone = [validateMongoId("zoneId", "Zone ID"), validateSubZoneName];
const validateEditSubZone = [validateMongoId("subZoneId", "Sub Zone ID"), ...validateAddSubZone];

const validateDeleteZone = [validateMongoId("zoneId", "Zone ID")];
const validateDeleteSubZone = [validateMongoId("zoneId", "Zone ID"), validateMongoId("subZoneId", "Sub Zone ID")];

module.exports = {
  validateAddZone,
  validateGetZone,
  validateEditZone,
  validateDeleteZone,
  validateAddSubZone,
  validateEditSubZone,
  validateDeleteSubZone,
};
