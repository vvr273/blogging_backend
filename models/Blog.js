import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" }, // short summary
    searchDescription: { type: String, default: "" }, // keywords
    content: { type: String, required: true },
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
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    editedAt: { type: Date }
  }
],

    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // optional
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    category: { type: String, default: "" },
  },
  { timestamps: true }
);
export default mongoose.model("Blog", blogSchema);
