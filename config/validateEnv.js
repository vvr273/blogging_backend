const normalizeProvider = (value = "") => value.toLowerCase().trim();

const requiredKeys = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

const validateBaseEnv = () => {
  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const validateMailEnv = () => {
  const provider = normalizeProvider(process.env.EMAIL_PROVIDER || "smtp");

  if (provider === "resend") {
    const missing = ["RESEND_API_KEY", "RESEND_FROM_EMAIL"].filter(
      (key) => !process.env[key]
    );
    if (missing.length) {
      throw new Error(
        `EMAIL_PROVIDER=resend but missing variables: ${missing.join(", ")}`
      );
    }
    return;
  }

  const missing = ["EMAIL_USER", "EMAIL_PASS"].filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`EMAIL_PROVIDER=smtp but missing variables: ${missing.join(", ")}`);
  }
};

export const validateEnv = () => {
  validateBaseEnv();
  validateMailEnv();
};
