import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Applied", "Shortlisted", "Rejected"], default: "Applied" },

    //  extended if required
    coverLetter: { type: String },
    resumePath: { type: String },
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
