import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure all upload directories exist
const resumeDir = "uploads/resumes";
const companyLogoDir = "uploads/company/logos";
const companyDocDir = "uploads/company/docs";

[resumeDir, companyLogoDir, companyDocDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "resumeFile") cb(null, resumeDir);
        else if (file.fieldname === "companyLogo") cb(null, companyLogoDir);
        else if (file.fieldname === "companyDocument") cb(null, companyDocDir);
        else cb(null, "uploads/others"); // fallback
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === "resumeFile") {
        // Students → only PDF
        file.mimetype === "application/pdf"
            ? cb(null, true)
            : cb(new Error("Only PDF resumes allowed"));
    } else if (file.fieldname === "companyLogo") {
        // Recruiters → logo can be image
        file.mimetype.startsWith("image/")
            ? cb(null, true)
            : cb(new Error("Only image files allowed for logo"));
    } else if (file.fieldname === "companyDocument") {
        // Recruiters → company docs (PDF)
        file.mimetype === "application/pdf"
            ? cb(null, true)
            : cb(new Error("Only PDF allowed for company documents"));
    } else {
        cb(null, false);
    }
};

const upload = multer({ storage, fileFilter });

export default upload;