# Prompt Version 1 (v1) — Milestone 1 Baseline Prompt

- **Date:** 2026-10-09 (Submitted in Milestone 1 Form, Q18)
- **Author:** Samanyu Khanna (BastionBytes)
- **Role / Task:** Monolithic resume reviewer comparing resume with job description, scoring, gap analysis, and bullet rewriting.
- **Model / Tool:** ChatGPT / Gemini (Default settings, temperature ~0.7)

---

## Prompt Text

```text
Act as a resume reviewer. Compare the given resume with the job description. Identify matching skills, missing skills, and areas for improvement. Suggest 2–3 improved resume bullet points based only on the candidate’s actual experience. Give a match score out of 100 with clear reasons. Do not invent qualifications or experience.

Input: 
Resume: B.Tech student with Python, SQL, and a data analysis project using Excel. 
Job Description: Data Analyst Intern requiring Python, SQL, Excel, and data visualization skills.
```

---

## Sample Output Received (Milestone 1)

```text
Match Score: 70/100 
Matching Skills: Python, SQL, Excel, and data analysis project experience. 
Skill Gaps: Data visualization experience is not clearly mentioned in the resume. 
Suggested Bullet Points: 
- Analysed data using Python and SQL to identify patterns and useful insights. 
- Used Excel to organize and analyse data for an academic project. 
Reason for Score: The resume matches several technical requirements, but data visualization experience is not evident. The score is an estimate based on the listed requirements.
```

---

## Evaluation & Observed Limitations (Why it was changed)

1. **High Score Variance:** Running this exact prompt 10 times on the same input produced scores ranging between **58/100 and 85/100** (standard deviation $\sigma = 8.6$). There was no rubric or weighting.
2. **Hallucination on Complex Resumes:** On longer resumes, the model frequently invented technologies (e.g., assuming candidate knew Tableau or PowerBI simply because Excel data analysis was mentioned).
3. **Unstructured Output:** Plain text output was brittle and impossible for frontend code to reliably parse into UI cards or tables.
4. **Lack of Evidence Grounding:** The model made claims like "strong technical fit" without citing exact lines or section spans from the candidate's resume.
5. **Vague Bullet Point Rewrites:** Suggested bullet points were generic rewrites rather than metrics-driven, impact-oriented statements.
