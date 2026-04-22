import pdfParse from "pdf-parse";
import { HfInference } from "@huggingface/inference";

// ─── Vector Math ────────────────────────────────────────────────────────────

export function dotProduct(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorNorm(v) {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(a, b) {
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

// ─── PDF Extraction ─────────────────────────────────────────────────────────

export async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text.trim();
}

// ─── Embedding Generation ───────────────────────────────────────────────────

export async function computeEmbeddings(texts, hfClient) {
  const embeddings = await hfClient.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: texts,
  });

  return embeddings;
}

// ─── Keyword Matching ───────────────────────────────────────────────────────

export function keywordScore(resumeText, jobDesc) {
  const jobWords = new Set(
    (jobDesc.toLowerCase().match(/\b[a-zA-Z]+\b/g) || [])
  );

  const resumeWords = new Set(
    (resumeText.toLowerCase().match(/\b[a-zA-Z]+\b/g) || [])
  );

  if (jobWords.size === 0) return 0;

  let commonCount = 0;
  for (const word of jobWords) {
    if (resumeWords.has(word)) commonCount++;
  }

  return commonCount / jobWords.size;
}

// ─── Scoring Engine ─────────────────────────────────────────────────────────

export async function computeSimilarity(resumeText, jobDesc, hfClient) {
  const [v1, v2] = await computeEmbeddings([resumeText, jobDesc], hfClient);

  const semanticScore = cosineSimilarity(v1, v2);

  const keywordMatch = keywordScore(resumeText, jobDesc);

  let finalScore = (0.8 * semanticScore) + (0.2 * keywordMatch);

  finalScore = Math.min(finalScore * 1.15, 1.0);

  return finalScore;
}

// ─── LLM Review Generation ──────────────────────────────────────────────────

export async function generateReview(groqClient, resumeText, jobDesc, score) {
  const prompt = `
    You are an expert career coach and ATS optimization consultant.

    IMPORTANT:
    - DO NOT use Markdown bolding (no **).
    - DO NOT use any special characters in headers.
    - Follow the format EXACTLY.

    Job Description:
    ${jobDesc}

    Resume:
    ${resumeText}

    Match Score: ${score.toFixed(2)}

    Provide the review in the format:

    STRENGTHS:
    - Point

    WEAKNESSES:
    - Point

    HIRING POTENTIAL:
    Verdict here.

    RECOMMENDATIONS:
    - Point
    `;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0].message.content.trim();
}