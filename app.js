import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(requestLogger);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/profile", profileRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
