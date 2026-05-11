import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import User from "../models/User.js";
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

test("GET /api/auth/dashboard returns user data for valid token", async () => {
  const user = await User.create({
    name: "Auth User",
    email: "auth@example.com",
    password: "hashed-password",
    isVerified: true,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const response = await request(app)
    .get("/api/auth/dashboard")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.email, "auth@example.com");
  assert.equal(response.body.data.name, "Auth User");
  assert.ok(response.body.requestId);
});
