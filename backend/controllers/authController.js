// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { Student, Company } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "replace_this";

// ------------------- SIGNUP -------------------
export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password)
            return res.status(400).json({ message: "Missing fields" });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email: email.toLowerCase(),
            password: hashed,
        });

        await user.save();

        return res.status(201).json({
            message: "User created successfully",
            user: { email: user.email, fullName: user.fullName },
        });
    } catch (err) {
        console.error("Signup Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ------------------- LOGIN -------------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Missing credentials" });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const payload = { id: user._id, role: user.role, email: user.email };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES || "2h",
        });

        return res.json({
            message: "Login successful",
            token,
            user: { email: user.email, fullName: user.fullName, role: user.role },
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ------------------- SET ROLE -------------------
export const setRole = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role)
            return res.status(400).json({ message: "Missing email or role" });

        if (!["student", "recruiter"].includes(role))
            return res.status(400).json({ message: "Invalid role" });

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: { role } },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ message: "Role updated successfully", role: user.role });
    } catch (err) {
        console.error("SetRole Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ------------------- SAVE STUDENT DETAILS -------------------
export const saveStudentDetails = async (req, res) => {
    try {
        const {
            email,
            firstName,
            middleName,
            lastName,
            country,
            address,
            phone,
            skills,
        } = req.body;

        if (!email) return res.status(400).json({ message: "Missing email" });

        const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : "";

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "User not found" });

        const parsedSkills = typeof skills === "string" ? JSON.parse(skills) : (skills || []);

        const student = await Student.findOneAndUpdate(
            { user: user._id },
            {
                $set: {
                    name: { firstName, middleName, lastName },
                    contact: { country, address, phone, email },
                    skills: parsedSkills,
                    resumePath,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.json({
            message: "Student details saved successfully",
            studentDetails: student,
        });
    } catch (err) {
        console.error("SaveStudentDetails Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ------------------- SAVE COMPANY DETAILS -------------------
export const saveCompanyDetails = async (req, res) => {
    try {
        const { email, companyName, website, companyWebsite, description, companyType, location, contactPerson, contactPhone } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });

        const resolvedWebsite = website || companyWebsite || "";

        const logoPath = req.files?.companyLogo
            ? `/uploads/company/${req.files.companyLogo[0].filename}`
            : "";
        const docPath = req.files?.companyDocument
            ? `/uploads/company/${req.files.companyDocument[0].filename}`
            : "";

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "User not found" });

        const company = await Company.findOneAndUpdate(
            { user: user._id },
            {
                $set: {
                    companyName,
                    website: resolvedWebsite,
                    description,
                    companyType,
                    location,
                    contactPerson,
                    contactPhone,
                    logoPath,
                    docPath,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.json({
            message: "Company details saved successfully",
            companyDetails: company,
        });
    } catch (err) {
        console.error("SaveCompanyDetails Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
