const express = require('express');

const protect = require('../middleware/authMiddleware');

const {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} = require ("../controllers/customerController");

const {
    customerValidator,
    updateCustomerValidator
} = require("../validators/customerValidator");

const validate = require("../middleware/validationMiddleware");

const router = express.Router();

//All customer routes require authentication
router.use(protect);

//create customer
router.post("/", customerValidator, validate, createCustomer);

//get all customer
router.get("/", getAllCustomers);

router.get("/:id", getCustomerById);

router.put("/:id", updateCustomerValidator, validate, updateCustomer);

router.delete("/:id", deleteCustomer);

module.exports = router;