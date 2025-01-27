const express = require("express");
const { signup, login, forgotPassword, verifyOtp, resetPassword } = require("../controllers/authControllers");
const { signupValidation, loginValidation } = require("../Middlewares/authValidation");

const router = express.Router();

// Signup route
router.post("/signup", signupValidation, signup);

// Login route
router.post("/login", loginValidation, login);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Verify OTP route
router.post("/verify-otp", verifyOtp);

// Reset password route
router.post("/reset-password", resetPassword);

module.exports = router;
