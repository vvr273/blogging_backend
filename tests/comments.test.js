import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import { clearTestDb, setupTestDb, teardownTestDb } from "./setup.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.ARCJET_KEY = process.env.ARCJET_KEY || "test-key";

test.before(async () => {
  await setupTestDb();
});

test.after(async () => {
  await teardownTestDb();
});

test.beforeEach(async () => {
  await clearTestDb();
});

test("comment CRUD works via /api/blogs/:id/comments endpoints", async () => {
  const author = await User.create({
    name: "Author User",
    email: "author@example.com",
    password: "hashed-password",
    isVerified: true,
  });

  const commenter = await User.create({
    name: "Comment User",
    email: "commenter@example.com",
    password: "hashed-password",
    isVerified: true,
  });

  const token = jwt.sign({ id: commenter._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const blog = await Blog.create({
    title: "Test Blog Title",
    content: "This is enough content for the validation minimum length.",
    author: author._id,
    commentable: true,
  });

  const createRes = await request(app)
    .post(`/api/blogs/${blog._id}/comments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ text: "First comment" });

  assert.equal(createRes.status, 200);
  assert.equal(createRes.body.comments.length, 1);
  assert.equal(createRes.body.comments[0].text, "First comment");

  const commentId = createRes.body.comments[0]._id;

  const editRes = await request(app)
    .put(`/api/blogs/${blog._id}/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ text: "Updated comment" });

  assert.equal(editRes.status, 200);
  assert.equal(editRes.body.comments[0].text, "Updated comment");

  const deleteRes = await request(app)
    .delete(`/api/blogs/${blog._id}/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.comments.length, 0);

  const remaining = await Comment.countDocuments({ blog: blog._id });
  assert.equal(remaining, 0);
});
