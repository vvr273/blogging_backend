// backend/routes/authRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import arcjectm from "../middlewares/arcjectMiddleware.js";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getDashboard,
  updateWaterCounter,
  addTodo,
  toggleTodo,
  deleteTodo,
} from "../controllers/authController.js";
import {
  validateForgotPassword,
  validateGoogleLogin,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateTodoText,
  validateWaterUpdate,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", arcjectm, validateRegister, register);
router.post("/login", arcjectm, validateLogin, login);
router.post("/google-login", arcjectm, validateGoogleLogin, googleLogin);
router.get("/verify/:token",verifyEmail);
router.post("/forgot-password", arcjectm, validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", arcjectm, validateResetPassword, resetPassword);

// Protected routes
router.get("/dashboard", protect, getDashboard);
router.put("/water", protect, validateWaterUpdate, updateWaterCounter);
router.post("/todos", protect, validateTodoText, addTodo);
router.put("/todos/:id", protect, toggleTodo);
router.delete("/todos/:id", protect, deleteTodo);




export default router;
