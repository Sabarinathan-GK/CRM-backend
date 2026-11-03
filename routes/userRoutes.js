const express = require('express');

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const { getProfile, getAllUsers, updateUserStatus } = require('../controllers/userController');

const router = express.Router();

//all routes require authentication
router.use(protect);

//Any authenticated user can access their profile
router.get("/profile", getProfile);

//Only admins can manage users
router.get("/", authorize("admin"), getAllUsers);

router.patch("/:id/status", authorize("admin"), updateUserStatus);

module.exports = router;