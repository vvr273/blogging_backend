import express from "express";
import {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  deleteComment,
  shareBlog,
  getTrendingBlogs,
  editComment
} from "../controllers/blogControllers.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/all",getAllBlogs);
router.get("/trending",getTrendingBlogs);
router.get("/my", protect, getMyBlogs);
import mongoose from "mongoose";
import arcjectm from "../middlewares/arcjectMiddleware.js";
// import arcjectm from "../middlewares/arcjectMiddleware.js";

router.get("/:id",async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }
  next();
}, getSingleBlog);

// Protected
router.post("/", protect, createBlog);

router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

// Likes & Shares
router.put("/:id/like", protect, toggleLike);
router.put("/:id/share", protect, shareBlog);

// Comments
router.post("/:id/comment", protect, addComment);
router.put("/:id/comment/:commentId", protect, editComment); // <--- ADDED THIS
router.delete("/:id/comment/:commentId", protect, deleteComment);
export default router;
