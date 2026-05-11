const isEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const fail = (res, message) =>
  res.status(400).json({
    success: false,
    message,
    code: "VALIDATION_ERROR",
    details: [],
  });

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
    return fail(res, "Name must be between 2 and 60 characters");
  }
  if (!email || !isEmail(email)) return fail(res, "Valid email is required");
  if (!password || typeof password !== "string" || password.length < 8 || password.length > 128) {
    return fail(res, "Password must be between 8 and 128 characters");
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !isEmail(email)) return fail(res, "Valid email is required");
  if (!password || typeof password !== "string") return fail(res, "Password is required");
  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) return fail(res, "Valid email is required");
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 8 || password.length > 128) {
    return fail(res, "Password must be between 8 and 128 characters");
  }
  next();
};

export const validateGoogleLogin = (req, res, next) => {
  const { credential } = req.body;
  if (!credential || typeof credential !== "string") return fail(res, "Google credential is required");
  next();
};

export const validateWaterUpdate = (req, res, next) => {
  const { amount } = req.body;
  if (typeof amount !== "number" || !Number.isFinite(amount) || Math.abs(amount) > 5000) {
    return fail(res, "Amount must be a finite number between -5000 and 5000");
  }
  next();
};

export const validateTodoText = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim() || text.trim().length > 200) {
    return fail(res, "Todo text is required and must be at most 200 characters");
  }
  next();
};

export const validateBlogPayload = (req, res, next) => {
  const { title, content, description, tags, category } = req.body;
  if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 180) {
    return fail(res, "Title must be between 3 and 180 characters");
  }
  if (!content || typeof content !== "string" || content.trim().length < 20) {
    return fail(res, "Content must be at least 20 characters");
  }
  if (description && (typeof description !== "string" || description.length > 300)) {
    return fail(res, "Description must be at most 300 characters");
  }
  if (tags && (!Array.isArray(tags) || tags.length > 10)) {
    return fail(res, "Tags must be an array with at most 10 items");
  }
  if (category && (typeof category !== "string" || category.length > 50)) {
    return fail(res, "Category must be at most 50 characters");
  }
  next();
};

export const validateCommentPayload = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim() || text.trim().length > 1000) {
    return fail(res, "Comment text is required and must be at most 1000 characters");
  }
  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { name, username, phoneNumber, profileImage } = req.body;
  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60)) {
    return fail(res, "Name must be between 2 and 60 characters");
  }
  if (username !== undefined && (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 30)) {
    return fail(res, "Username must be between 3 and 30 characters");
  }
  if (phoneNumber !== undefined && (typeof phoneNumber !== "string" || phoneNumber.length > 20)) {
    return fail(res, "Phone number must be at most 20 characters");
  }
  if (profileImage !== undefined && (typeof profileImage !== "string" || profileImage.length > 2048)) {
    return fail(res, "Profile image URL is invalid");
  }
  next();
};
