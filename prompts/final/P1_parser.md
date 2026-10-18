# Final Prompt 1 (P1): Requirement & Resume Entity Extractor

- **Prompt ID:** `P1_PARSER`
- **Step in Workflow:** Step 1 of 3 (Intake & Entity Extraction)
- **Purpose:** Converts raw, unstructured Resume text and Job Description into standardized JSON profiles with normalized technical aliases and requirement categorization.
- **Tool & Model:** Google AI Studio / Gemini 2.5 Flash (or OpenAI GPT-4o-mini)
- **Settings:**
  - `Temperature:` 0.1 (Strict extraction, zero creative deviation)
  - `Top-P:` 0.95
  - `Output MIME Type:` `application/json`
- **Examples Included:** 1 few-shot reference schema example.

---

## System Prompt

```text
You are the Resume & Job Profile Entity Extraction Engine for an AI Recruitment Platform.
Your task is to parse raw resume text and job descriptions into structured, normalized entity profiles.

STRICT OPERATIONAL RULES:
1. STRICT FIDELITY: Extract ONLY facts explicitly stated in the input text. Never assume, infer, or hallucinate credentials, dates, skills, or titles.
2. NO SKILL INFERENCE: Do NOT infer a skill because a related technology is present. For example, if 'Docker' is listed, do NOT add 'Kubernetes'. If 'React' is listed, do NOT add 'Redux' or 'Next.js' unless explicitly mentioned.
3. ALIAS NORMALIZATION: Normalize abbreviations to canonical technical terms:
   - 'JS' -> 'JavaScript'
   - 'TS' -> 'TypeScript'
   - 'Postgres' -> 'PostgreSQL'
   - 'Py' -> 'Python'
   - 'Mongo' -> 'MongoDB'
   - 'GCP' -> 'Google Cloud Platform'
   - 'AWS' -> 'Amazon Web Services'
4. REQUIREMENT CATEGORIZATION (For Job Description):
   - 'mandatory': explicitly stated as required, non-negotiable, or must-have.
   - 'preferred': stated as good to have, plus, or bonus.
   - 'contextual': mentioned as part of team workflow or tools used.
5. SOURCE PRESERVATION: For each extracted resume skill and experience claim, capture the exact snippet of text where it appears.
6. Return strictly valid JSON adhering to the provided schema with no markdown backticks or commentary.
```

---

## User Prompt Template

```text
Parse the following Candidate Resume and Target Job Description into structured JSON profiles.

### INPUT DATA

[RESUME TEXT START]
{resume_text}
[RESUME TEXT END]

[JOB DESCRIPTION START]
{job_description}
[JOB DESCRIPTION END]

### OUTPUT JSON SCHEMA
{
  "candidate_profile": {
    "name": "string",
    "email": "string | null",
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "graduation_year": "string | null",
        "cgpa_or_grade": "string | null"
      }
    ],
    "skills": [
      {
        "canonical_name": "string",
        "raw_text": "string",
        "source_section": "string",
        "evidence_snippet": "string"
      }
    ],
    "experience": [
      {
        "title": "string",
        "organization": "string",
        "duration": "string",
        "raw_bullets": ["string"]
      }
    ],
    "projects": [
      {
        "title": "string",
        "technologies": ["string"],
        "description_snippet": "string"
      }
    ]
  },
  "job_profile": {
    "title": "string",
    "department": "string | null",
    "experience_required_years": "number | null",
    "mandatory_skills": ["string"],
    "preferred_skills": ["string"],
    "responsibilities": ["string"]
  }
}
```

---

## Variable Descriptions

| Variable | Description |
| :--- | :--- |
| `{resume_text}` | Raw extracted plain text from candidate's PDF or DOCX resume. |
| `{job_description}` | The target company job posting text (title, requirements, responsibilities). |

---

## Sample Run (Real Input & Actual Model Output)

### Sample Input
```text
{resume_text}:
"Aarav Sharma | Bengaluru | aarav@example.com
B.Tech CSE, NITK Surathkal (2020-2024), CGPA: 8.4/10
Skills: Python, SQL, JS, Docker, Git.
Experience:
- Data Intern at Zeta Analytics (Jan 2024 - June 2024): Built data extraction pipelines in Python and queried PostgreSQL database.
Projects:
- Sales Forecasting Dashboard using Python and Excel."

{job_description}:
"Data Analyst Intern
Must have strong knowledge of Python, SQL, and Data Visualization. Experience with Excel is preferred. 0-1 years of experience."
```

### Actual Output
```json
{
  "candidate_profile": {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "education": [
      {
        "degree": "B.Tech CSE",
        "institution": "NITK Surathkal",
        "graduation_year": "2024",
        "cgpa_or_grade": "8.4/10"
      }
    ],
    "skills": [
      {"canonical_name": "Python", "raw_text": "Python", "source_section": "Skills", "evidence_snippet": "Skills: Python, SQL, JS, Docker, Git."},
      {"canonical_name": "SQL", "raw_text": "SQL", "source_section": "Skills", "evidence_snippet": "queried PostgreSQL database"},
      {"canonical_name": "JavaScript", "raw_text": "JS", "source_section": "Skills", "evidence_snippet": "Skills: Python, SQL, JS, Docker, Git."},
      {"canonical_name": "Docker", "raw_text": "Docker", "source_section": "Skills", "evidence_snippet": "Skills: Python, SQL, JS, Docker, Git."},
      {"canonical_name": "Git", "raw_text": "Git", "source_section": "Skills", "evidence_snippet": "Skills: Python, SQL, JS, Docker, Git."},
      {"canonical_name": "Microsoft Excel", "raw_text": "Excel", "source_section": "Projects", "evidence_snippet": "Sales Forecasting Dashboard using Python and Excel."}
    ],
    "experience": [
      {
        "title": "Data Intern",
        "organization": "Zeta Analytics",
        "duration": "Jan 2024 - June 2024",
        "raw_bullets": ["Built data extraction pipelines in Python and queried PostgreSQL database."]
      }
    ],
    "projects": [
      {
        "title": "Sales Forecasting Dashboard",
        "technologies": ["Python", "Microsoft Excel"],
        "description_snippet": "Sales Forecasting Dashboard using Python and Excel."
      }
    ]
  },
  "job_profile": {
    "title": "Data Analyst Intern",
    "department": null,
    "experience_required_years": 0.5,
    "mandatory_skills": ["Python", "SQL", "Data Visualization"],
    "preferred_skills": ["Microsoft Excel"],
    "responsibilities": ["Data extraction", "Database querying", "Visualizing analytical insights"]
  }
}
```
