import express from "express";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

import {
  analyzeResume,
  formatJD
} from "../controllers/reviewController.js";

router.post("/analyze", upload.single("resume"), analyzeResume);
router.post("/format-jd", formatJD);

export default router;