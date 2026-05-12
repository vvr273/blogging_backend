const requiredKeys = ["MONGO_URI", "JWT_SECRET"];

const validateBaseEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  const hasFrontendUrl = Boolean(process.env.FRONTEND_URL || process.env.CLIENT_URL);
  if (!hasFrontendUrl) missing.push("FRONTEND_URL (or CLIENT_URL)");
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const validateMailEnv = () => {
  const hasSmtpCreds = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasEmailCreds = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  if (!hasSmtpCreds && !hasEmailCreds) {
    throw new Error("Missing SMTP credentials: set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS");
  }
};

export const validateEnv = () => {
  validateBaseEnv();
  validateMailEnv();
};
