const { body } = require('express-validator');

const customerValidator = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ min : 2, max : 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Customer email is required")
    .isEmail()
    .withMessage("Please provide a valid customer email")
    .normalizeEmail(),
    body("phone")
    .trim()
    .notEmpty()
    .withMessage("Customer phone number is required"),
    body("company")
    .optional()
    .trim()
    .isLength({ max : 100 })
    .withMessage("Company name cannot exceed 100 characters"),
    body("status")
    .optional()
    .isIn(["active", "inactive", "prospect"])
    .withMessage("Invalid customer status"),
    body("notes")
    .optional()
    .trim()
    .isLength({ max : 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
    body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assigned user Id")
]

const updateCustomerValidator = [
    body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid customer email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer phone number cannot be empty"),

  body("company").optional().trim(),

  body("status")
    .optional()
    .isIn(["active", "inactive", "prospect"])
    .withMessage("Invalid customer status"),

  body("notes").optional().trim(),

  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assigned user ID"),
];

module.exports = {
    customerValidator,
    updateCustomerValidator
}