const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Signup functionality
const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate that the password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists, you can log in", success: false });
    }

    // Create new user
    const newUser = new UserModel({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "Signup successful", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Login functionality
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "Authentication failed", success: false });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Authentication failed", success: false });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Forgot Password - Generate OTP and send email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Generate a reset token and expiration time
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpire = Date.now() + 3600000; // 1 hour from now

    // Update the user document with the reset token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    // Send reset token via email (you need to configure your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please use the following OTP to reset your password: ${resetToken}. This OTP is valid for 1 hour.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Verify OTP and allow password reset
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if the OTP matches and is within the expiration time
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired", success: false });
    }

    // OTP is valid
    res.status(200).json({ message: "OTP verified", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Check if the OTP matches and is within the expiration time
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired", success: false });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = { signup, login, forgotPassword, verifyOtp, resetPassword };