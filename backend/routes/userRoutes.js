import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Application from "../models/Application.js";

const router = express.Router();

// GET /api/users/:id
// Minimal public profile for recommender
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid user id" });
    }

    // Mongoose ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // don't throw a cast error; return empty profile instead
      return res.json({
        skills: [],
        interests: [],
        applied: [],
        preferred_companies: []
      });
    }

    // Try to fetch user document (non-throwing)
    const user = await User.findById(id).lean().exec();

    // If user not found, return empty arrays (recommender tolerates it)
    const skills = (user && Array.isArray(user.skills)) ? user.skills : [];
    const interests = (user && Array.isArray(user.interests)) ? user.interests : [];

    // Fetch applications for this student (applied job ids)
    let applied = [];
    try {
      const apps = await Application.find({ student: id }).select("job").lean().exec();
      applied = Array.isArray(apps) ? apps.map(a => String(a.job)) : [];
    } catch (e) {
      // ignore application lookup errors and leave applied = []
      console.warn("user route: application lookup failed", e.message || e);
      applied = [];
    }

    return res.json({
      skills,
      interests,
      applied,
      preferred_companies: []
    });
  } catch (err) {
    console.error("USER ROUTE ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;