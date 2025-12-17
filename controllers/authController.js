import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ===== REGISTER =====
// Add this import at the top of authController.js
import { sendVerificationEmail } from "../utils/sendVerificationEmail.js";

export const register = async (req, res) => {
  try { 
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        // FIX: Use the utility function
        await sendVerificationEmail(user.email, token); 
        return res.status(200).json({ message: "Verification email resent. Check inbox." });
      }
      return res.status(400).json({ message: "User already exists and verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30m" });
    
    // FIX: Use the utility function and AWAIT it
    await sendVerificationEmail(user.email, token);

    res.status(201).json({ message: "User registered. Verification email sent!" });
  } catch (err) {
    console.error("Signup Error:", err); // Log the actual error to Render logs
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// ===== VERIFY EMAIL =====
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

// ===== LOGIN =====
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ message: "Verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    res.json({ token, user: { id: user._id, email: user.email,waterCounter: user.waterCounter || 0,todos: user.todos || [] } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== GOOGLE LOGIN =====
// export const googleLogin = async (req, res) => {
//   try {
//     const { tokenId } = req.body;
//     const ticket = await googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID });
//     const payload = ticket.getPayload();

//     let user = await User.findOne({ email: payload.email });
//     if (!user) {
//       user = await User.create({ name: payload.name, email: payload.email, googleId: payload.sub, isVerified: true });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ token, user: { id: user._id, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// ===== FORGOT PASSWORD =====
// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: "User not found" });

//   const token = crypto.randomBytes(20).toString("hex");
//   user.resetPasswordToken = token;
//   user.resetPasswordExpires = Date.now() + 3600000;
//   await user.save();

//   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
//   await sendEmail(user.email, "Reset Password", `Click to reset: ${resetUrl}`);

//   res.json({ message: "Password reset email sent" });
// };
// import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
// Make sure User is also imported

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  await sendResetPasswordEmail(user.email, token);

  res.json({ message: "Password reset email sent" });
};


// ===== RESET PASSWORD =====
// export const resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   const user = await User.findOne({
//     resetPasswordToken: token,
//     resetPasswordExpires: { $gt: Date.now() }
//   });

//   if (!user) return res.status(400).json({ message: "Invalid or expired token" });

//   user.password = await bcrypt.hash(password, 10);
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;
//   await user.save();

//   res.json({ message: "Password reset successful" });
// };
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.json({ message: "Password reset successful" });
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // frontend sends { credential }
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }  

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
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

    // Create JWT for your app
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

// ✅ Update water counter
export const updateWaterCounter = async (req, res) => {
  const { amount } = req.body; // amount to increment/decrement
  req.user.waterCounter += amount;
  if (req.user.waterCounter < 0) req.user.waterCounter = 0;
  await req.user.save();
  res.json({ waterCounter: req.user.waterCounter });
};

// ✅ Add new todo
export const addTodo = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Todo text required" });
  req.user.todos.push({ text });
  await req.user.save();
  res.json({ todos: req.user.todos });
};

// ✅ Update todo (toggle done)
export const toggleTodo = async (req, res) => {
  const { id } = req.params;
  const todo = req.user.todos.id(id);
  if (!todo) return res.status(404).json({ message: "Todo not found" });
  todo.done = !todo.done;
  await req.user.save();
  res.json({ todos: req.user.todos });
};

// ✅ Delete todo
// controllers/todoController.js
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
