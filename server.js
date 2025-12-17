import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));


// Body Parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs",blogRoutes);
app.use("/api/profile", profileRoutes);



// Start Server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
