import Application from "../models/Application.js";
import Job from "../models/Job.js";

export const applyToJob = async (req, res) => {
    try {
        const studentId = req.user.id; 

        if (!studentId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { jobId, coverLetter, resumePath } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: "jobId is required" });
        }

        const job = await Job.findById(jobId);
        if (!job || job.status !== "Open") {
            return res.status(404).json({ message: "Job not found or closed" });
        }


        const existing = await Application.findOne({
            job: jobId,
            student: studentId,
        });

        if (existing) {
            return res.status(409).json({ message: "Already applied" });
        }

        const app = await Application.create({
            job: jobId,
            student: studentId,
            coverLetter,
            resumePath,
        });

        await Job.updateOne(
            { _id: jobId },
            { $inc: { applicantsCount: 1 } }
        );

        return res.status(201).json({
            message: "Application submitted",
            application: app,
        });
    } catch (err) {
        console.error("applyToJob error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const withdrawApplication = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const deleted = await Application.findOneAndDelete({
      job: jobId,
      student: studentId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }

    await Job.updateOne(
      { _id: jobId },
      { $inc: { applicantsCount: -1 } }
    );

    return res.json({ message: "Application withdrawn" });

  } catch (err) {
    console.error("withdrawApplication error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const apps = await Application.find({ student: studentId }).populate("job").sort({ createdAt: -1 });
    return res.json({ applications: apps });
  } catch (err) {
    console.error("getMyApplications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getApplicantsForJob = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) return res.status(401).json({ message: "Unauthorized" });

    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const apps = await Application.find({ job: jobId }).populate("student", "fullName email").sort({ createdAt: -1 });
    return res.json({ applicants: apps });
  } catch (err) {
    console.error("getApplicantsForJob error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    if (!recruiterId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { status } = req.body; // "Shortlisted" | "Rejected" | "Applied"

    const app = await Application.findById(id).populate("job");
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (String(app.job.recruiter) !== String(recruiterId)) return res.status(403).json({ message: "Forbidden" });

    if (!['Applied', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    app.status = status;
    await app.save();

    return res.json({ message: "Status updated", application: app });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
