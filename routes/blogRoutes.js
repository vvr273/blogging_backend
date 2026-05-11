import express from "express";
import mongoose from "mongoose";
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
  editComment,
} from "../controllers/blogControllers.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  validateBlogPayload,
  validateCommentPayload,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

const validateBlogId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
      code: "VALIDATION_ERROR",
      details: [],
    });
  }
  return next();
};

// Public
router.get("/all", getAllBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/my", protect, getMyBlogs);
router.get("/:id", validateBlogId, getSingleBlog);

// Protected
router.post("/", protect, validateBlogPayload, createBlog);
router.put("/:id", protect, validateBlogPayload, updateBlog);
router.delete("/:id", protect, deleteBlog);

// Likes & Shares
router.put("/:id/like", protect, toggleLike);
router.put("/:id/share", protect, shareBlog);

// Comments (normalized)
router.post("/:id/comments", protect, validateCommentPayload, addComment);
router.put("/:id/comments/:commentId", protect, validateCommentPayload, editComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

// Temporary backward-compatible aliases (remove after frontend cache/deploy is stable)
router.post("/:id/comment", protect, validateCommentPayload, addComment);
router.put("/:id/comment/:commentId", protect, validateCommentPayload, editComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);

export default router;
