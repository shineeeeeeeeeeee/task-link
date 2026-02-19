import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { applyToJob, getMyApplications, getApplicantsForJob, updateApplicationStatus, withdrawApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.use(protect);

// Student endpoints
router.post("/", applyToJob);
router.delete("/", withdrawApplication);
router.get("/mine", getMyApplications);

// Recruiter endpoints
router.get("/job/:jobId", getApplicantsForJob);
router.patch("/:id/status", updateApplicationStatus);

export default router;
