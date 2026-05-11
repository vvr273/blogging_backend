import mongoose from "mongoose";
// import { type } from "os";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, minlength: 2, maxlength: 60 },
  username: { type: String, trim: true, lowercase: true, minlength: 3, maxlength: 30 },
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  
  password: { type: String, minlength: 8, maxlength: 255 },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, default: null },
  phoneNumber: { type: String, default: null, trim: true, maxlength: 20 },
  role: { type: String, default: "user", enum: ["user", "author", "admin"] },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  waterCounter: { type: Number, default: 0 },
  todos: [
    {
      text: { type: String, trim: true, maxlength: 200 },
      done: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  commentedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
  profileImage: { type: String, default: "", maxlength: 2048 }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);
