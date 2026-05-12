// backend/routes/authRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  verifyEmailOtp,
  resendEmailOtp,
  resendVerification,
  forgotPassword,
  resendResetOtp,
  resetPasswordWithOtp,
  getDashboard,
  updateWaterCounter,
  addTodo,
  toggleTodo,
  deleteTodo,
} from "../controllers/authController.js";
import {
  validateForgotPassword,
  validateResendVerification,
  validateVerifyOtp,
  validateGoogleLogin,
  validateLogin,
  validateRegister,
  validateResetPasswordOtp,
  validateTodoText,
  validateWaterUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/google-login", validateGoogleLogin, googleLogin);
router.get("/verify/:token",verifyEmail);
router.post("/verify-otp", validateVerifyOtp, verifyEmailOtp);
router.post("/resend-otp", validateResendVerification, resendEmailOtp);
router.post("/resend-verification", validateResendVerification, resendVerification);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/forgot-password/resend-otp", validateForgotPassword, resendResetOtp);
router.post("/reset-password-otp", validateResetPasswordOtp, resetPasswordWithOtp);

// Protected routes
router.get("/dashboard", protect, getDashboard);
router.put("/water", protect, validateWaterUpdate, updateWaterCounter);
router.post("/todos", protect, validateTodoText, addTodo);
router.put("/todos/:id", protect, toggleTodo);
router.delete("/todos/:id", protect, deleteTodo);




export default router;
