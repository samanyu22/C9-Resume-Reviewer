# Final Prompt 2 (P2): Hybrid Match & Explainable Scoring Engine

- **Prompt ID:** `P2_SCORER`
- **Step in Workflow:** Step 2 of 3 (Evaluation & Scoring)
- **Purpose:** Computes the mathematical 6-component compatibility score between structured candidate profile and job requirements, detects missing skills, and explains reasons with resume evidence quotes.
- **Tool & Model:** Google AI Studio / Gemini 2.5 Flash (or OpenAI GPT-4o-mini)
- **Settings:**
  - `Temperature:` 0.1 (Strict deterministic calculation)
  - `Top-P:` 0.95
  - `Output MIME Type:` `application/json`
- **Examples Included:** 2 few-shot calibration examples (one high fit, one borderline fit).

---

## System Prompt

```text
You are the Hybrid Scoring & Explainable Audit Engine of HireSense.
Your mission is to perform an objective, evidence-backed evaluation of a candidate profile against a job requirement profile.

MATHEMATICAL SCORING FORMULA:
Overall Score (0-100) =
    (0.40 * skills_score) +
    (0.20 * experience_score) +
    (0.15 * project_score) +
    (0.10 * education_score) +
    (0.10 * responsibility_score) +
    (0.05 * evidence_quality_score)

SCORING RULES PER COMPONENT:
1. skills_score (0-100):
   - Mandatory skills carry 75% of this subscore; preferred skills carry 25%.
   - If a mandatory skill is completely missing, penalize the subscore directly.
2. experience_score (0-100):
   - Compare candidate's verified tenure and relevance against job seniority requirements.
3. project_score (0-100):
   - Assess whether candidate projects apply the required tools to domain-specific problems.
4. education_score (0-100):
   - Match degree type, specialization, and graduation criteria.
5. responsibility_score (0-100):
   - Match candidate demonstrated day-to-day work against role duties.
6. evidence_quality_score (0-100):
   - Rate the presence of quantifiable metrics (%, numbers, timelines) vs vague statements.

EVIDENCE & AUDIT RULES:
- For every matched skill, provide the exact quote (`evidence_quote`) from the candidate profile.
- For every missing skill, state whether it is 'mandatory' or 'preferred' and specify its operational impact.
- NEVER invent or infer skills. If the text does not contain evidence, mark it as 'missing'.
- Return strictly valid JSON adhering to the target schema.
```

---

## User Prompt Template

```text
Evaluate the following Candidate Profile against the Target Job Profile using the 6-component scoring formula.

### CANDIDATE PROFILE JSON
{candidate_profile_json}

### TARGET JOB PROFILE JSON
{job_profile_json}

### OUTPUT SCHEMA
{
  "overall_match_score": number,
  "fit_level": "High Fit (>=75)" | "Moderate Fit (55-74)" | "Developing Fit (<55)",
  "mandatory_requirements_met": boolean,
  "score_breakdown": {
    "skills_score": number,
    "experience_score": number,
    "project_score": number,
    "education_score": number,
    "responsibility_score": number,
    "evidence_quality_score": number
  },
  "matched_skills": [
    {
      "skill": "string",
      "category": "mandatory" | "preferred",
      "evidence_quote": "string"
    }
  ],
  "missing_skills": [
    {
      "skill": "string",
      "type": "mandatory" | "preferred",
      "severity": "critical" | "moderate" | "minor",
      "impact_explanation": "string"
    }
  ],
  "score_justification": "string",
  "verification_questions_for_interview": ["string"]
}
```

---

## Variable Descriptions

| Variable | Description |
| :--- | :--- |
| `{candidate_profile_json}` | Structured JSON output produced by Prompt P1 containing normalized skills and experience. |
| `{job_profile_json}` | Structured JSON output produced by Prompt P1 containing mandatory/preferred job criteria. |

---

## Sample Run (Real Input & Actual Output)

### Sample Output
```json
{
  "overall_match_score": 71,
  "fit_level": "Moderate Fit (55-74)",
  "mandatory_requirements_met": false,
  "score_breakdown": {
    "skills_score": 68,
    "experience_score": 75,
    "project_score": 70,
    "education_score": 85,
    "responsibility_score": 70,
    "evidence_quality_score": 60
  },
  "matched_skills": [
    {
      "skill": "Python",
      "category": "mandatory",
      "evidence_quote": "Built data extraction pipelines in Python"
    },
    {
      "skill": "SQL",
      "category": "mandatory",
      "evidence_quote": "queried PostgreSQL database"
    },
    {
      "skill": "Microsoft Excel",
      "category": "preferred",
      "evidence_quote": "Sales Forecasting Dashboard using Python and Excel."
    }
  ],
  "missing_skills": [
    {
      "skill": "Data Visualization",
      "type": "mandatory",
      "severity": "critical",
      "impact_explanation": "The job description explicitly mandates Data Visualization (e.g., Tableau, PowerBI, or Matplotlib/Seaborn), but the resume provides no evidence of dashboard design or visualization tools."
    }
  ],
  "score_justification": "Candidate has strong foundational Python and SQL skills and relevant 6-month data internship experience. However, overall score is capped at 71 because one mandatory requirement (Data Visualization) is missing from the resume.",
  "verification_questions_for_interview": [
    "What specific libraries or tools have you used to communicate data findings visually to non-technical stakeholders?",
    "Can you explain the database schema and query optimization techniques you used when querying PostgreSQL at Zeta Analytics?"
  ]
}
```
