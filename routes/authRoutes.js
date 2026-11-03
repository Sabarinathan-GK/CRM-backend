const express = require("express");

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

const {
  signupValidator,
  loginValidator,
} = require("../validators/authValidator");

const validate = require("../middleware/validationMiddleware");
const  protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginValidator, validate, login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.put("/change-password", protect, changePassword);

module.exports = router;