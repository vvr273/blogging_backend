import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_TTL_MIN || 10);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SEC || 60);
const OTP_DAILY_LIMIT = Number(process.env.OTP_DAILY_LIMIT || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(`${otp}${process.env.EMAIL_OTP_SECRET || process.env.JWT_SECRET}`)
    .digest("hex");

const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const issueAndSendOtp = async (user, requestId) => {
  const now = new Date();
  const key = dayKey(now);
  let record = await OtpVerification.findOne({ userId: user._id });
  if (!record) record = new OtpVerification({ userId: user._id, resendDayKey: key });

  if (record.resendDayKey !== key) {
    record.resendDayKey = key;
    record.resendCountDaily = 0;
  }

  if (record.lastSentAt) {
    const nextAllowedAt = new Date(record.lastSentAt.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000);
    if (now < nextAllowedAt) {
      const waitSeconds = Math.ceil((nextAllowedAt.getTime() - now.getTime()) / 1000);
      const err = new Error(`Please wait ${waitSeconds}s before requesting another OTP.`);
      err.code = "COOLDOWN";
      throw err;
    }
  }

  if (record.resendCountDaily >= OTP_DAILY_LIMIT) {
    const err = new Error("Daily resend limit reached");
    err.code = "DAILY_LIMIT";
    throw err;
  }

  const otp = generateOtp();
  record.otpHash = hashOtp(otp);
  record.expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  record.attempts = 0;
  record.lastSentAt = now;
  record.resendCountDaily += 1;
  record.consumedAt = null;
  await record.save();

  try {
    await sendOtpEmail(user.email, otp);
  } catch (err) {
    console.error("OTP email send failed:", {
      requestId,
      userId: user._id?.toString?.(),
      email: user.email,
      message: err.message,
    });
    throw err;
  }
};

const sendResetPasswordEmailNow = async (email, token, requestId) => {
  try {
    await sendResetPasswordEmail(email, token);
  } catch (err) {
    console.error("Reset password email send failed:", {
      requestId,
      email,
      message: err.message,
    });
    throw err;
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists and verified" });
      }
      await issueAndSendOtp(user, req.requestId);
      return res.status(200).json({ message: "OTP sent to your email. Verify to activate account." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    await issueAndSendOtp(user, req.requestId);
    return res.status(201).json({ message: "User registered. OTP sent to your email." });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Registration failed. Unable to send OTP email." });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const record = await OtpVerification.findOne({ userId: user._id });
    if (!record || !record.otpHash || !record.expiresAt || record.expiresAt < new Date() || record.consumedAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if ((record.attempts || 0) >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    const incomingHash = hashOtp(otp);
    if (incomingHash !== record.otpHash) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    record.consumedAt = new Date();
    record.otpHash = null;
    record.expiresAt = null;
    record.attempts = 0;
    await record.save();

    return res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Verify OTP error:", {
      requestId: req.requestId,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage = "If the account exists and is not verified, an OTP has been sent.";

    const user = await User.findOne({ email });
    if (!user || user.isVerified) return res.json({ message: genericMessage });

    await issueAndSendOtp(user, req.requestId);
    return res.json({ message: genericMessage });
  } catch (err) {
    console.error("Resend OTP error:", {
      requestId: req.requestId,
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const resendVerification = resendEmailOtp;

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ message: "Verify your email with OTP first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        waterCounter: user.waterCounter || 0,
        todos: user.todos || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage =
      "If an account with that email exists, a password reset link has been sent.";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: genericMessage });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendResetPasswordEmailNow(user.email, token, req.requestId);

    res.json({ message: genericMessage });
  } catch (err) {
    console.error("Forgot password error:", {
      requestId: req.requestId,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.json({ message: "Password reset successful" });
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        profilePic: picture,
        authProvider: "google",
        isVerified: true,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};

export const getDashboard = async (req, res) => {
  const { name, email, waterCounter, todos } = req.user;
  res.json({ name, email, waterCounter, todos });
};

export const updateWaterCounter = async (req, res) => {
  const { amount } = req.body;
  req.user.waterCounter += amount;
  if (req.user.waterCounter < 0) req.user.waterCounter = 0;
  await req.user.save();
  res.json({ waterCounter: req.user.waterCounter });
};

export const addTodo = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Todo text required" });
  req.user.todos.push({ text });
  await req.user.save();
  res.json({ todos: req.user.todos });
};

export const toggleTodo = async (req, res) => {
  const { id } = req.params;
  const todo = req.user.todos.id(id);
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  todo.done = !todo.done;
  await req.user.save();
  res.json({ todos: req.user.todos });
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { todos: { _id: id } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ todos: updatedUser.todos });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: "Server error deleting todo" });
  }
};
