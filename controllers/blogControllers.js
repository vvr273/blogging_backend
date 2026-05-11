import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";

const parsePagination = (req, defaults = { page: 1, limit: 10, maxLimit: 100 }) => {
  const rawPage = Number.parseInt(req.query.page, 10);
  const rawLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : defaults.page;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, defaults.maxLimit)
    : defaults.limit;
  return { page, limit, skip: (page - 1) * limit };
};

const buildBlogWithComments = async (blogId, options = { page: 1, limit: 20 }) => {
  const blog = await Blog.findById(blogId).populate("author", "name email");
  if (!blog) return null;

  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const totalComments = await Comment.countDocuments({ blog: blogId });
  const comments = await Comment.find({ blog: blogId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "name");

  const payload = blog.toObject();
  payload.comments = comments.map((comment) => ({
    _id: comment._id,
    user: comment.user,
    text: comment.text,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
  }));
  payload.commentsPagination = {
    page,
    limit,
    total: totalComments,
    totalPages: Math.ceil(totalComments / limit) || 1,
  };

  return payload;
};

// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const { title, description, searchDescription, content, image, commentable, tags, category } = req.body;

    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

    const blog = await Blog.create({
      title,
      description: description || "",
      searchDescription: searchDescription || "",
      content,
      image: image || "",
      commentable: commentable ?? true,
      tags: tags || [],
      category: category || "",
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const hasPaginationQuery = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, skip } = parsePagination(req, { page: 1, limit: 12, maxLimit: 50 });
    const total = await Blog.countDocuments();
    const blogs = await Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!hasPaginationQuery) return res.json(blogs);
    res.json({
      items: blogs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get blogs of the logged-in user
export const getMyBlogs = async (req, res) => {
  try {
    const hasPaginationQuery = req.query.page !== undefined || req.query.limit !== undefined;
    const { page, limit, skip } = parsePagination(req, { page: 1, limit: 12, maxLimit: 50 });
    const query = { author: req.user._id };
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    if (!hasPaginationQuery) return res.json(blogs);
    res.json({
      items: blogs,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get single blog & increment views
export const getSingleBlog = async (req, res) => {
  try {
    const { page, limit } = parsePagination(req, { page: 1, limit: 20, maxLimit: 100 });
    const blog = await Blog.findById(req.params.id).populate("author", "name email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increment views
    blog.views += 1;
    await blog.save();
    const payload = await buildBlogWithComments(blog._id, { page, limit });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { title, description, searchDescription, content, image, commentable, tags, category } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.searchDescription = searchDescription || blog.searchDescription;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.commentable = commentable ?? blog.commentable;
    blog.tags = tags || blog.tags;
    blog.category = category || blog.category;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    await Comment.deleteMany({ blog: blog._id });
    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const index = blog.likes.indexOf(req.user._id);
    if (index === -1) blog.likes.push(req.user._id);
    else blog.likes.splice(index, 1);

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment cannot be empty" });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (!blog.commentable) {
      return res.status(403).json({ message: "Comments disabled for this post" });
    }

    await Comment.create({ blog: blog._id, user: req.user._id, text });
    blog.commentsCount += 1;
    await blog.save();

    const payload = await buildBlogWithComments(blog._id, { page: 1, limit: 20 });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Share a blog
export const shareBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (!blog.shares.includes(req.user._id)) blog.shares.push(req.user._id);
    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Trending Blogs (most views + likes)
export const getTrendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" } // 1. Calculate the size of the likes array
        }
      },
      {
        $sort: { 
          likesCount: -1, // 2. Sort by the new calculated field (Highest likes first)
          views: -1       // 3. If likes are equal, sort by views
        }
      },
      {
        $limit: 10 // 4. Get top 10
      },
      // 5. Since 'populate' doesn't work in aggregate, we use $lookup to get author details
      {
        $lookup: {
          from: "users",       // IMPORTANT: This must match your User collection name in MongoDB (usually lowercase plural 'users')
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      {
        $unwind: "$author" // 6. Lookup returns an array, this converts it to a single object
      },
      {
        $project: {
          "author.password": 0, // 7. Remove sensitive author data
          "author.createdAt": 0,
          "author.updatedAt": 0
        }
      }
    ]);

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, blog: id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // only comment author can edit
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text;
    comment.editedAt = new Date();
    await comment.save();

    const payload = await buildBlogWithComments(id, { page: 1, limit: 20 });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = await Comment.findOne({ _id: commentId, blog: id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isBlogAuthor = blog.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isBlogAuthor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Comment.deleteOne({ _id: commentId });
    if (blog.commentsCount > 0) {
      blog.commentsCount -= 1;
    }
    await blog.save();

    const payload = await buildBlogWithComments(blog._id, { page: 1, limit: 20 });
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
