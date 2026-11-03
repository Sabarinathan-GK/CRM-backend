const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboardStats
} = require("../controllers/dashboardController");

const router = express.Router();

//Authentication : user must have a valid JWT
router.use(protect);

//Authentication : only admins can access dashboard statistics
router.get("/stats", authorize("admin"), getDashboardStats);

module.exports = router;

