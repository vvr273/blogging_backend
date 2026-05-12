const requiredKeys = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

const validateBaseEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const validateMailEnv = () => {
  const hasSmtpCreds = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasEmailCreds = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  if (!hasSmtpCreds && !hasEmailCreds) {
    throw new Error(
      "Missing SMTP credentials: set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS"
    );
  }
};

export const validateEnv = () => {
  validateBaseEnv();
  validateMailEnv();
};
