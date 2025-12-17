// backend/routes/authRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
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
// import arcjectm from "../middlewares/arcjectMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register",register);
router.post("/login",login);
router.post("/google-login",googleLogin);
router.get("/verify/:token",verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/dashboard", protect, getDashboard);
router.put("/water", protect, updateWaterCounter);
router.post("/todos", protect, addTodo);
router.put("/todos/:id", protect, toggleTodo);
router.delete("/todos/:id", protect, deleteTodo);




export default router;
