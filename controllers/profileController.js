import User from "../models/User.js";
import Blog from "../models/Blog.js";

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const blogs = await Blog.find({ author: req.user._id })
      .select("title createdAt views likes")
      .sort({ createdAt: -1 });

    res.json({
      profile: user,
      stats: {
        totalBlogs: blogs.length,
        totalLikes: blogs.reduce((sum, b) => sum + b.likes.length, 0),
      },
      blogs,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "username", "phoneNumber", "profileImage"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
