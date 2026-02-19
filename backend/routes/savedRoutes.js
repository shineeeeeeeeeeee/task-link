import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId/save", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.savedJobs.includes(req.params.jobId)) {
      user.savedJobs.push(req.params.jobId);
      await user.save();
    }

    res.json({ message: "Job saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving job" });
  }
});

router.post("/:jobId/unsave", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.savedJobs = user.savedJobs.filter(
      (id) => id.toString() !== req.params.jobId
    );

    await user.save();

    res.json({ message: "Job removed from saved" });
  } catch (err) {
    res.status(500).json({ message: "Error removing job" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("savedJobs");
    res.json(user.savedJobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching saved jobs" });
  }
});

export default router;
