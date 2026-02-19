import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./config/db.js";
import path from "path";
import fs from "fs";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";

dotenv.config();
const app = express();

const uploadDirs = [
    "uploads/resumes",
    "uploads/company/logos",
    "uploads/company/docs"
];
uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// static files (uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS globally
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
// handle preflight requests
app.options("*", cors());

// middleware to parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();

// routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved", savedRoutes);

// test route
app.get("/", (req, res) => res.send("Backend running successfully"));

// start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));