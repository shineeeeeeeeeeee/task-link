import mongoose from "mongoose";

// Base user for authentication and role only
const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "recruiter", ""], default: "" },
  },
  { timestamps: true }
);

// Student schema
const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: {
      firstName: { type: String, default: "" },
      middleName: { type: String, default: "" },
      lastName: { type: String, default: "" },
    },
    contact: {
      country: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    skills: { type: [String], default: [] },
    resumePath: { type: String, default: "" },
  },
  { timestamps: true }
);

// Company schema
const CompanySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    logoPath: { type: String, default: "" },
    docPath: { type: String, default: "" },
    // fields available for future extension:
    companyType: { type: String, default: "" },
    location: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", StudentSchema);
export const Company = mongoose.model("Company", CompanySchema);
export default mongoose.model("User", UserSchema);