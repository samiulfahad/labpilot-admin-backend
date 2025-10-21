/** @format */
const { body } = require("express-validator");
const { validateMongoId } = require("./mongoId")

// Validate zoneName
const validateZoneName = body("zoneName")
    .notEmpty()
    .withMessage("Zone name is required.")
    .bail()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Zone name must not exceed 150 characters.");

// Validate subZoneName
const validateSubZoneName = body("subZoneName")
    .notEmpty()
    .withMessage("Sub Zone name is required.")
    .bail()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Subzone name must not exceed 150 characters.");


const zoneValidationRules = [
    validateZoneName
];

const subZoneValidationRules = [
    validateMongoId( "zoneId", "Zone ID" ),
    validateSubZoneName
];

module.exports = { subZoneValidationRules, zoneValidationRules };