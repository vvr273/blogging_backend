import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import { validateEnv } from "./config/validateEnv.js";

dotenv.config();
validateEnv();
const PORT = process.env.PORT || 5000;


// Start Server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
