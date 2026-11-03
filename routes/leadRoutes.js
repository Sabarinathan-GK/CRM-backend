const express = require('express');

const protect = require("../middleware/authMiddleware");

const {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
} = require('../controllers/leadController');

const { leadValidator, updateLeadValidator } = require('../validators/leadValidator');

const validate = require("../middleware/validationMiddleware");

const router = express.Router();

//All lead routes requires authentication
router.use(protect);

router.post("/", leadValidator, validate, createLead);

router.get("/",getLeads);

router.get("/:id", getLeadById);

router.put("/:id", updateLeadValidator, validate, updateLead);

router.delete("/:id", deleteLead);

module.exports = router;

