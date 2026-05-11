import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
    description: { type: String, default: "", trim: true, maxlength: 300 }, // short summary
    searchDescription: { type: String, default: "", trim: true, maxlength: 300 }, // keywords
    content: { type: String, required: true, minlength: 20 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: "" },
    commentable: { type: Boolean, default: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    editedAt: { type: Date }
  }
],

    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional
    views: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, default: "", trim: true, maxlength: 50 },
  },
  { timestamps: true }
);

blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });

export default mongoose.model("Blog", blogSchema);
