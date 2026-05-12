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
  emailOtpHash: { type: String, default: null },
  emailOtpExpires: { type: Date, default: null },
  emailOtpAttempts: { type: Number, default: 0 },
  emailOtpLastSentAt: { type: Date, default: null },
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

userSchema.index({ username: 1 }, { unique: true, sparse: true });

const userHasData = async (userDoc) => {
  if (!userDoc) return false;

  const hasProfileData =
    (userDoc.waterCounter || 0) > 0 ||
    (userDoc.todos?.length || 0) > 0 ||
    (userDoc.posts?.length || 0) > 0 ||
    (userDoc.likedPosts?.length || 0) > 0 ||
    (userDoc.commentedPosts?.length || 0) > 0 ||
    Boolean((userDoc.profileImage || "").trim());

  if (hasProfileData) return true;

  const Blog = mongoose.models.Blog || mongoose.model("Blog");
  const authoredBlogsCount = await Blog.countDocuments({ author: userDoc._id });
  return authoredBlogsCount > 0;
};

const blockDeleteIfUserHasData = async (userDoc) => {
  const hasData = await userHasData(userDoc);
  if (hasData) {
    const err = new Error("User has existing data and cannot be deleted");
    err.statusCode = 403;
    throw err;
  }
};

userSchema.pre("deleteOne", { document: true, query: false }, async function () {
  await blockDeleteIfUserHasData(this);
});

userSchema.pre("findOneAndDelete", async function () {
  const userDoc = await this.model.findOne(this.getQuery());
  await blockDeleteIfUserHasData(userDoc);
});

userSchema.pre("findOneAndRemove", async function () {
  const userDoc = await this.model.findOne(this.getQuery());
  await blockDeleteIfUserHasData(userDoc);
});

export default mongoose.model("User", userSchema);
