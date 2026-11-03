const { body } = require('express-validator');

const leadValidator = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Lead name is required")
    .isLength({ min : 2, max : 100 })
    .withMessage("Lead name must be between 2 and 100 characters"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Lead email is required")
    .isEmail()
    .withMessage("Please provide a valid lead email")
    .normalizeEmail(),

    body("phone")
    .trim()
    .notEmpty()
    .withMessage("Lead phone number is required"),

    body("company")
    .optional()
    .trim()
    .isLength({ max : 100})
    .withMessage("Company name cannot exceed 100 characters"),

    body("source")
    .optional()
    .isIn([
        "website",
        "referral",
        "social-media",
        "advertisement",
        "cold-call",
        "Other"
    ])
    .withMessage("Invalid lead status"),

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

const updateLeadValidator = [
    body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lead name is required")
    .isLength({ min : 2, max : 100 })
    .withMessage("Lead name must be between 2 and 100 characters"),

    body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lead email is required")
    .isEmail()
    .withMessage("Please provide a valid lead email")
    .normalizeEmail(),

    body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Lead phone number is required"),

    body("company")
    .optional()
    .optional()
    .trim()
    .isLength({ max : 100})
    .withMessage("Company name cannot exceed 100 characters"),

    body("source")
    .optional()
    .isIn([
        "website",
        "referral",
        "social-media",
        "advertisement",
        "cold-call",
        "Other"
    ])
    .withMessage("Invalid lead status"),

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

module.exports = {
    leadValidator,
    updateLeadValidator
}