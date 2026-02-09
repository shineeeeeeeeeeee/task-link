import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import path from "path";
import fs from "fs";

dotenv.config();
const app = express();
// ---------------------------
// Ensure Upload Folders Exist
const uploadDirs = [
    "uploads/resumes",
    "uploads/company/logos",
    "uploads/company/docs"
];
uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
// ---------------------------
// Serve static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// ---------------------------
// Enable CORS globally
app.use(
    cors({
        origin: "http://localhost:5173", // frontend URL
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
// Handle preflight requests
app.options("*", cors());
// ---------------------------
// Middleware to parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ---------------------------
// Connect MongoDB
connectDB();
// ---------------------------
// Routes (auth + uploads)
app.use("/api/auth", authRoutes);
// ---------------------------
// Test Route
app.get("/", (req, res) => res.send("Backend running successfully"));
// ---------------------------
// Server Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));