import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

dotenv.config();

const migrate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const blogs = await Blog.collection.find({ comments: { $exists: true, $ne: [] } }).toArray();
  let migrated = 0;

  for (const blog of blogs) {
    const comments = Array.isArray(blog.comments) ? blog.comments : [];
    if (!comments.length) continue;

    const existingCount = await Comment.countDocuments({ blog: blog._id });
    if (existingCount > 0) continue;

    const docs = comments
      .filter((c) => c?.user && c?.text)
      .map((c) => ({
        blog: blog._id,
        user: c.user,
        text: c.text,
        createdAt: c.createdAt || blog.createdAt || new Date(),
        updatedAt: c.editedAt || c.createdAt || new Date(),
        editedAt: c.editedAt || undefined,
      }));

    if (docs.length) {
      await Comment.insertMany(docs, { ordered: false });
      await Blog.updateOne(
        { _id: blog._id },
        { $set: { commentsCount: docs.length }, $unset: { comments: "" } }
      );
      migrated += docs.length;
    }
  }

  console.log(`Migration complete. Migrated comments: ${migrated}`);
  await mongoose.disconnect();
};

migrate().catch(async (err) => {
  console.error("Migration failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
