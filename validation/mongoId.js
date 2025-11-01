const { body } = require("express-validator");

const validateMongoId = (field, fieldName = "ID") => {
    return body(field)
        .notEmpty()
        .withMessage(`${fieldName} is required`)
        .bail() 
        .isMongoId()
        .withMessage(`Invalid ${fieldName}`);
};

const validateMongoIdIfProvided = (field, fieldName = "ID") => {
    return body(field)
        .optional()
        .isMongoId()
        .withMessage(`Invalid ${fieldName}`);
};

module.exports = { validateMongoId, validateMongoIdIfProvided }