import requests
from urllib.parse import urljoin
from datetime import datetime
import re

BACKEND_BASE = "http://127.0.0.1:5001"


# ---------------- NORMALIZER ----------------
def normalize_skill(s):
    if not s:
        return ""

    s = str(s).lower().strip()

    # remove punctuation
    s = re.sub(r"[^\w\s]", "", s)

    # collapse spaces
    s = re.sub(r"\s+", " ", s).strip()

    # alias fixes
    aliases = {
        "nodejs": "node",
        "node js": "node",
        "reactjs": "react",
        "react js": "react",
        "css3": "css"
    }

    return aliases.get(s, s)


# ---------------- USER DATA ----------------
def get_user_data(user_id, auth_token=None):
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    try:
        url = urljoin(BACKEND_BASE, f"/api/users/{user_id}")
        resp = requests.get(url, headers=headers, timeout=5)
        resp.raise_for_status()

        data = resp.json()

        print("USER API RESPONSE:", data)

        return {
            "skills": data.get("skills", []) or [],
            "interests": data.get("interests", []) or [],
            "applied": data.get("applied", []) or [],
            "preferred_companies": data.get("preferred_companies", []) or []
        }

    except Exception as e:
        print("get_user_data ERROR:", str(e))

        # IMPORTANT: do NOT silently fake skills anymore
        return {
            "skills": [],
            "interests": [],
            "applied": [],
            "preferred_companies": []
        }


# ---------------- JOBS ----------------
def fetch_open_jobs(auth_token=None):
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"

    try:
        url = urljoin(BACKEND_BASE, "/api/jobs/open")
        resp = requests.get(url, headers=headers, timeout=5)
        resp.raise_for_status()
        return resp.json()

    except Exception as e:
        print("fetch_open_jobs ERROR:", str(e))
        return []


# ---------------- RECOMMENDER ----------------
def recommend_jobs(user_data, top_k=5, auth_token=None):
    jobs = fetch_open_jobs(auth_token=auth_token)

    # USER SKILLS (FIXED)
    raw_user_skills = user_data.get("skills", []) or []
    user_skills = set(normalize_skill(s) for s in raw_user_skills if s)

    interests = set(normalize_skill(i) for i in user_data.get("interests", []))
    applied_ids = set(str(i) for i in user_data.get("applied", []))

    scored = []

    for job in jobs:
        job_id = str(job.get("_id") or job.get("id") or job.get("jobId"))

        if not job_id or job_id in applied_ids:
            continue

        # JOB SKILLS (FIXED)
        raw_job_skills = job.get("skills", []) or []
        job_required = [
            normalize_skill(s)
            for s in raw_job_skills
            if s
        ]

        # MATCHING (FIXED)
        skill_matches = sorted(list(set(job_required) & user_skills))
        missing_skills = [s for s in job_required if s not in skill_matches]

        skill_score = len(skill_matches)

        # interest match
        title = normalize_skill(job.get("title", ""))
        interest_score = 1 if any(i in title for i in interests) else 0

        # recency
        recency_score = 0
        posted = job.get("postedAt")

        if posted:
            try:
                posted_dt = datetime.fromisoformat(posted)
                days = (datetime.utcnow() - posted_dt).days
                if days <= 7:
                    recency_score = 1
            except:
                pass

        score = (2 * skill_score) + interest_score + (0.5 * recency_score)

        # reason
        if not job_required:
            reason = "Job has no listed skills"
        elif not raw_user_skills:
            reason = "User profile matching skills"
        elif skill_score == 0:
            reason = "No matching skills"
        else:
            reason = "Matched"

        scored.append({
            "job_id": job_id,
            "title": job.get("title"),
            "company": job.get("company"),

            "skills_required": raw_job_skills,
            "skills_matched": skill_matches,
            "missing_skills": missing_skills,

            "reason": reason,
            "score": round(score, 2),

            "slug": job.get("slug") or f"/jobs/{job_id}"
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return scored[:top_k]