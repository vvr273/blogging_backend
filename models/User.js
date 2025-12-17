import mongoose from "mongoose";
// import { type } from "os";

const userSchema = new mongoose.Schema({
  name: { type: String },
  username:{type: String},
  email: { type: String, unique: true, required: true },
  
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  role: { type: String, default: "user", enum: ["user", "author", "admin"] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  waterCounter: { type: Number, default: 0 },
  todos: [
    {
      text: { type: String },
      done: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  commentedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  profileImage: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
