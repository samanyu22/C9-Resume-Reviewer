# Prompt Version 2 (v2) — Rubric-Guided & JSON Output

- **Date:** 2026-10-28
- **Author:** Samanyu Khanna & Yuvraj Pathania (BastionBytes)
- **Role / Task:** Added explicit 6-part weighted scoring formula and enforced raw JSON schema output.
- **Model / Tool:** Gemini 1.5 Flash / GPT-4o-mini (Temperature: 0.3)

---

## What Changed from v1

1. **Explicit Scoring Rubric:** Introduced the mathematical formula:
   $$\text{Score} = 0.40 \times \text{Skills} + 0.20 \times \text{Experience} + 0.15 \times \text{Projects} + 0.10 \times \text{Education} + 0.10 \times \text{Responsibilities} + 0.05 \times \text{Evidence}$$
2. **Requirement Categorization:** Instructed the model to tag requirements as `mandatory` vs `preferred`.
3. **Structured JSON Output:** Required output in JSON format with `match_score`, `score_breakdown`, `matched_skills`, `missing_skills`, and `improved_bullets`.

---

## Prompt Text (v2)

```text
You are an expert technical recruiter and resume evaluator.
Evaluate the candidate's resume against the job description using the following strict weighted rubric:
- Skills match (40%): percentage of mandatory and preferred technical skills present.
- Experience fit (20%): relevance of candidate's past work and internship tenure.
- Project relevance (15%): alignment of listed projects to the job responsibilities.
- Education fit (10%): degree and academic background alignment.
- Responsibility match (10%): evidence of handling similar daily responsibilities.
- Evidence quality (5%): presence of quantifiable metrics and specific source quotes.

CRITICAL INSTRUCTION:
Do not infer a skill unless explicitly stated. Return ONLY valid JSON in this format:
{
  "match_score": number,
  "score_breakdown": {
    "skills": number,
    "experience": number,
    "projects": number,
    "education": number,
    "responsibilities": number,
    "evidence_quality": number
  },
  "mandatory_passed": boolean,
  "matched_skills": [{"skill": string, "evidence": string}],
  "missing_skills": [{"skill": string, "type": "mandatory" | "preferred"}],
  "improved_bullets": [string]
}

Input:
Resume: {resume_text}
Job Description: {job_description}
```

---

## Evaluation & Observed Results

- **Scoring Stability:** Score drift dropped significantly. Across 10 identical runs, score variation was within $\pm 3.2$ points (compared to $\pm 8.6$ in v1).
- **JSON Parsing Failures:** In **3 out of 10 runs**, the model wrapped output with ```json markdown tags or included conversational preamble ("Here is your JSON:"), causing frontend JSON.parse() exceptions.
- **Cognitive Overload:** Asking a single prompt to simultaneously parse text, normalize aliases (e.g. "JS" -> "JavaScript"), evaluate 6 mathematical rubric dimensions, and write creative bullet points degraded the quality of the bullet points and occasionally missed subtle skills in long resumes.
- **Resolution for v3:** Decompose the pipeline into 3 distinct, chained prompts:
  1. `P1_PARSER`: Dedicated extraction & alias normalization.
  2. `P2_SCORER`: Rigorous rubric scoring with evidence quotes.
  3. `P3_REWRITER`: Specialized bullet point rewriter using STAR methodology.
