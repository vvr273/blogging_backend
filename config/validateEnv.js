const requiredKeys = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

const validateBaseEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const validateMailEnv = () => {
  const missing = ["EMAIL_USER", "EMAIL_PASS"].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing SMTP environment variables: ${missing.join(", ")}`);
};

export const validateEnv = () => {
  validateBaseEnv();
  validateMailEnv();
};
