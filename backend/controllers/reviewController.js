import dotenv from "dotenv";
import Groq from "groq-sdk";
import { HfInference } from "@huggingface/inference";

import {
  extractTextFromPDF,
  computeSimilarity,
  generateReview,
} from "../resume_analyzer.js";

// ─── Environment ────────────────────────────────────────────────────────────

dotenv.config();
const hfApiKey = process.env.HF_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

const hfClient = new HfInference(hfApiKey);
const groqClient = new Groq({ apiKey: groqApiKey });

// ─── POST /analyze ──────────────────────────────────────────────────────────

export const analyzeResume = async (req, res) => {
        try {
            const jobDescription = req.body.job_description;

            if (!req.file) {
            return res.status(400).json({ error: "Resume file is required." });
            }
            if (!jobDescription) {
            return res.status(400).json({ error: "Job description is required." });
            }

            const resumeText = await extractTextFromPDF(req.file.buffer);

            const score = await computeSimilarity(resumeText, jobDescription, hfClient);

            const review = await generateReview(
            groqClient,
            resumeText,
            jobDescription,
            score
            );

            return res.json({
            score: Number(score),
            review: review,
            });
        } catch (err) {
            console.error("Error in /analyze:", err);
            return res.status(500).json({ error: "Internal server error." });
        }
    };

export const formatJD = async (req, res) => {
  try {
    const rawText = req.body.text || "";

    const prompt = `
    You are a Professional Document Architect. Your task is to clean up the layout of this Job Description while preserving 100% of the information.

    STRICT FORMATING RULES:
    1. ZERO MARKDOWN: Never use asterisks (**), underscores (_), or backticks (\`) for any reason.
    2. HEADER STYLE: If you see sections like Role Overview, Responsibilities, Requirements, or Qualifications, convert them to ALL CAPS.
    3. DYNAMIC HEADERS: If there are additional headers (e.g., LOCATION, DURATION, BENEFITS, NICE TO HAVE, OR ANYTHING ELSE.....), KEEP THEM. Just convert them to ALL CAPS as well.
    4. BULLETS: Use a simple dash (-) for all list items. 
    5. SPACING: Ensure one blank line between every major section for readability.
    6. NO DELETIONS: Do not remove any text. If the original text has specific details like "3-6 months" or "Remote", it MUST remain in the final output.
    7. NO EMOJIS: Use only plain professional text.

    TEXT TO RESTRUCTURE:
    ${rawText}
    `;

    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const formatted = response.choices[0].message.content.trim();
    return res.json({ formatted_text: formatted });
  } catch (err) {
    console.error("Error in /format-jd:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

