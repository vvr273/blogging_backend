import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { validateProfileUpdate } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, validateProfileUpdate, updateProfile);

export default router;
