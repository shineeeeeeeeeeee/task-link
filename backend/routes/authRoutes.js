import express from "express";
import upload from "../middleware/upload.js";
import {
    signup,
    login,
    setRole,
    saveStudentDetails,
    saveCompanyDetails,
} from "../controllers/authController.js";

const router = express.Router();

// ---------------- AUTH ROUTES ----------------
router.post("/signup", signup);
router.post("/login", login);
router.post("/role", setRole);

// ---------------- STUDENT ROUTE ----------------
// Accepts a single file (resume)
router.post("/details/student", upload.single("resumeFile"), saveStudentDetails);

// ---------------- COMPANY ROUTE ----------------
// Accepts two files (logo + company document)
router.post(
    "/details/company",
    upload.fields([
        { name: "companyLogo", maxCount: 1 },
        { name: "companyDocument", maxCount: 1 },
    ]),
    saveCompanyDetails
);

export default router;