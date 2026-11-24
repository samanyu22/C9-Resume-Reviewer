# SCSE4041 MINI PROJECT — MILESTONE 2
## AI-POWERED RESUME REVIEWER: RESUME FEEDBACK AGAINST A JOB DESCRIPTION
**Course:** SCSE4041 — Prompt Engineering | **School:** School of Computer Science Engineering & Technology (SCSET)

---

# SECTION 1: COVER PAGE

- **Team ID:** T42 *(Use the exact assigned ID from your LMS/email notification)*
- **Team Name:** BastionBytes
- **Project Title:** AI-Powered Resume Reviewer: Resume Feedback Against a Job Description (Problem Pool C9)
- **Batch / Group:** B49 - B64
- **Course Code & Title:** SCSE4041 — Prompt Engineering
- **Faculty / Mentor Name:** Dr. Sonal Sharma

### Team Members & Details
| S.No | Name | Enrollment No. | Institutional Email ID | Role |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Samanyu Khanna (Team Leader)** | **S24CSEU2705** | S24CSEU2705@bennett.edu.in | Prompt Architecture & Lead |
| **2** | Gurpreet Nagar | S24CSEU2313 | S24CSEU2313@bennett.edu.in | Prompt Engineering (Rewriter) |
| **3** | Yuvraj Pathania | S24CSEU2668 | S24CSEU2668@bennett.edu.in | Backend & Prompt Integration |
| **4** | Nakshatra Gupta | S24CSEU2317 | S24CSEU2317@bennett.edu.in | Frontend & Prototype UI |
| **5** | Ayush Tiwari | S24CSEU2318 | S24CSEU2318@bennett.edu.in | Evaluation & Testing |
| **6** | Varnit Agustya | S24CSEU2355 | S24CSEU2355@bennett.edu.in | Video Reel & Documentation |

### Submission Links
- **Prototype Link:** `https://github.com/samanyu22/C9-Resume-Reviewer` *(or deployed Vercel URL)*
- **GitHub Repository Link:** `https://github.com/samanyu22/C9-Resume-Reviewer`
- **Demo Video Reel Link:** `https://youtu.be/sample-unlisted-reel` *(or Google Drive link)*
- **Exact Video Length:** **110 Seconds** *(Between 90 and 150 seconds)*

---

# SECTION 2: PROMPT AND SOLUTION DESIGN

### 2.1 Problem, Audience, and Design Decisions

#### What problem does it solve and for whom?
College students and fresh graduates applying for internships and placements struggle to gauge how well their resumes match job descriptions. They receive opaque automated rejections without actionable feedback on missing skills, weak bullet points, or how to align their experiences. Concurrently, campus recruiters face massive applicant volumes and need transparent, explainable candidate evaluations rather than arbitrary black-box scores.

#### Input and Expected Output
- **Inputs:** Candidate's raw resume text (PDF/DOCX) and company target job description.
- **Expected Outputs:** 
  1. A structured requirement-level match matrix with verified evidence spans.
  2. A deterministic 0–100 compatibility score calculated across 6 weighted dimensions.
  3. Action-oriented, STAR-format bullet point suggestions grounded strictly in the candidate's actual experience without hallucinating unearned skills.

#### How many prompts/steps and why?
The solution uses **3 discrete, chained prompts** (`P1_PARSER`, `P2_SCORER`, `P3_REWRITER`). 
In our Milestone 1 baseline, a single monolithic prompt attempted to parse text, compute math, and generate creative bullet points all at once. This caused cognitive overload in the LLM, leading to severe score drift ($\sigma = 8.6$), hallucinated skills (e.g. inventing AWS experience), and frequent JSON parsing errors. Decomposing the pipeline isolates concerns: `P1` ensures strict entity extraction, `P2` enforces deterministic mathematical scoring with evidence quotes, and `P3` focuses exclusively on creative, truthful bullet point enhancement.

#### Which tool and model and why?
- **Model:** **Gemini 2.5 Flash** (via Google AI Studio & REST API).
- **Justification:** Gemini 2.5 Flash offers high reasoning capability for structured entity extraction, native JSON schema mode, low latency (<1.5s per turn), and an extensive context window capable of ingesting multi-page resumes and long job profiles without truncation.

#### What changed since Milestone 1?
- Transitioned from a single monolithic text prompt to a **3-stage decomposed pipeline**.
- Replaced subjective scoring with an objective, **6-component weighted mathematical rubric**.
- Implemented **canonical alias normalization** (`JS` $\rightarrow$ `JavaScript`, `Postgres` $\rightarrow$ `PostgreSQL`).
- Locked inference parameters (`temperature = 0.1`, `top_p = 0.95`) for deterministic output consistency.
- Added strict negative constraints (*"Do not infer skills from related tools; do not invent metrics"*).

---

### 2.2 System & Workflow Diagrams

#### Prompt Workflow Diagram
```
[Candidate Resume Text] ──┐
                          ├───> [ P1_PARSER ] ───> [ Candidate Profile JSON ] ──┐
[Job Description Text]  ──┘     (Temp: 0.1)        [ Job Profile JSON       ]   │
                                                                                ├───> [ P2_SCORER ] ───> [ 6-Part Match Report  ]
                                                                                │     (Temp: 0.1)        [ Matched Evidence Spans]
                                                                                │                        [ Missing Skill Gaps    ]
                                                                                │                                   │
                                                                                │                                   ▼
                                                                                └─────────────────────────> [ P3_REWRITER ]
                                                                                                            (Temp: 0.2)
                                                                                                                    │
                                                                                                                    ▼
                                                                                                        [ STAR Enhanced Bullets ]
```

#### System Architecture Diagram
```
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                   │
│   React 19 + Tailwind UI (ResumeUpload & AnalysisCard) │
└───────────────────────────┬────────────────────────────┘
                            │ (POST /api/analyze-resume)
                            ▼
┌────────────────────────────────────────────────────────┐
│               ORCHESTRATION PIPELINE                   │
│   FastAPI / TanStack Start Server Functions            │
│   • Input sanitization & PII boundary protection       │
│   • Sequential prompt chain execution                  │
│   • JSON schema validation & fallback recovery         │
└───────────────────────────┬────────────────────────────┘
                            │ (Deterministic API Calls)
                            ▼
┌────────────────────────────────────────────────────────┐
│               FOUNDATION LLM ENGINE                    │
│   Gemini 2.5 Flash (Google AI Studio API)              │
│   [P1 Extractor]  ──>  [P2 Scorer]  ──>  [P3 Rewriter] │
└────────────────────────────────────────────────────────┘
```

---

### 2.3 Prompt Sheets

#### Prompt Sheet 1: `P1_PARSER`
- **Prompt ID & Name:** `P1_PARSER` (Requirement & Resume Entity Extractor)
- **Step in Workflow:** Step 1 of 3 (Intake & Entity Extraction)
- **Purpose:** Standardizes raw resume text and job postings into structured JSON with canonical alias mapping and requirement typing.
- **Tool & Model:** Gemini 2.5 Flash in Google AI Studio
- **Settings:** Temperature: `0.1` | Top-P: `0.95` | Response MIME: `application/json`
- **System Prompt:**
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
- **User Prompt Template:**
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
    "education": [{"degree": "string", "institution": "string", "graduation_year": "string | null", "cgpa_or_grade": "string | null"}],
    "skills": [{"canonical_name": "string", "raw_text": "string", "source_section": "string", "evidence_snippet": "string"}],
    "experience": [{"title": "string", "organization": "string", "duration": "string", "raw_bullets": ["string"]}],
    "projects": [{"title": "string", "technologies": ["string"], "description_snippet": "string"}]
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
- **Variables:** `{resume_text}` (unstructured candidate resume string), `{job_description}` (recruiter job description text).
- **Examples Included:** 1 few-shot reference schema example.
- **Output Format:** Valid JSON object matching schema.
- **Sample Run:**
  - *Input:* Resume text of Aarav Sharma (Python, SQL, Excel) & Data Analyst Intern JD.
  - *Actual Output:* Successfully extracted all 6 normalized skills, tagged Data Visualization as `mandatory`, Excel as `preferred`, and preserved evidence quotes.

---

#### Prompt Sheet 2: `P2_SCORER`
- **Prompt ID & Name:** `P2_SCORER` (Hybrid Match & Explainable Scoring Engine)
- **Step in Workflow:** Step 2 of 3 (Evaluation & Scoring)
- **Purpose:** Executes the mathematical 6-component scoring formula, identifies matched skills with resume citations, and flags missing skills with severity impacts.
- **Tool & Model:** Gemini 2.5 Flash in Google AI Studio
- **Settings:** Temperature: `0.1` | Top-P: `0.95` | Response MIME: `application/json`
- **System Prompt:**
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
1. skills_score (0-100): Mandatory skills carry 75% of this subscore; preferred skills carry 25%. Missing mandatory skills heavily penalize this subscore.
2. experience_score (0-100): Compare verified tenure and relevance against role requirements.
3. project_score (0-100): Assess project application to domain-specific problems.
4. education_score (0-100): Match degree type and specialization.
5. responsibility_score (0-100): Match demonstrated day-to-day work against role duties.
6. evidence_quality_score (0-100): Rate presence of metrics and specific tools vs vague statements.

EVIDENCE & AUDIT RULES:
- For every matched skill, provide the exact quote (evidence_quote) from the candidate profile.
- For every missing skill, state whether it is 'mandatory' or 'preferred' and specify operational impact.
- NEVER invent or infer skills. If the text lacks proof, mark it as 'missing'.
- Return strictly valid JSON adhering to the schema.
```
- **User Prompt Template:**
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
  "matched_skills": [{"skill": "string", "category": "mandatory" | "preferred", "evidence_quote": "string"}],
  "missing_skills": [{"skill": "string", "type": "mandatory" | "preferred", "severity": "critical" | "moderate" | "minor", "impact_explanation": "string"}],
  "score_justification": "string",
  "verification_questions_for_interview": ["string"]
}
```
- **Variables:** `{candidate_profile_json}` (structured profile from P1), `{job_profile_json}` (structured requirements from P1).
- **Examples Included:** 2 few-shot calibration examples (High fit vs Moderate fit).
- **Output Format:** Valid JSON object.
- **Sample Run:** Overall Score: 71/100, Skills Score: 68, Experience: 75; flagged missing Data Visualization as a critical mandatory gap.

---

#### Prompt Sheet 3: `P3_REWRITER`
- **Prompt ID & Name:** `P3_REWRITER` (Action-Oriented Resume Bullet Point Rewriter)
- **Step in Workflow:** Step 3 of 3 (Actionable Feedback & Enhancement)
- **Purpose:** Rewrites weak candidate bullet points into high-impact, STAR-aligned statements tailored to the job without fabricating facts.
- **Tool & Model:** Gemini 2.5 Flash in Google AI Studio
- **Settings:** Temperature: `0.2` | Top-P: `0.95` | Response MIME: `application/json`
- **System Prompt:**
```text
You are the Resume Bullet Enhancement Engine of HireSense.
Your task is to rewrite existing, passive candidate resume bullet points into clear, punchy, action-verb-led statements that align with the target role.

STRICT ANTI-HALLUCINATION RULES:
1. TRUTHFUL GROUNDING: Base every rewrite STRICTLY on the candidate's actual stated experience.
   - Do NOT invent metrics, percentages, dollar figures, or project outcomes unless the candidate provided baseline figures.
   - If a metric is missing, use an honest qualitative impact verb (e.g., 'streamlined data extraction' rather than 'increased efficiency by 43%').
2. NO SKILL FABRICATION: Do NOT introduce new tools, libraries, or methodologies that the candidate did not mention in their resume.
3. ACTION-VERB ORIENTATION: Begin each bullet with a strong past-tense action verb (e.g., 'Architected', 'Engineered', 'Orchestrated', 'Optimized', 'Automated').
4. CLARITY & BREVITY: Keep each bullet between 15 and 25 words.
5. Return strictly valid JSON adhering to the provided schema.
```
- **User Prompt Template:**
```text
Rewrite the candidate's weak resume bullet points to better showcase alignment with the target job requirements without inventing any false facts.

### CANDIDATE'S ORIGINAL BULLET POINTS
{raw_bullet_points}

### TARGET JOB ROLE & SKILLS
Target Role: {job_title}
Key Skills to Highlight: {matched_and_relevant_skills}

### OUTPUT SCHEMA
{
  "enhanced_bullets": [
    {
      "original_bullet": "string",
      "rewritten_bullet": "string",
      "skill_highlighted": "string",
      "action_verb_used": "string",
      "improvement_rationale": "string"
    }
  ],
  "general_formatting_advice": "string"
}
```
- **Variables:** `{raw_bullet_points}` (extracted bullets), `{job_title}` (target role), `{matched_and_relevant_skills}` (verified skills).
- **Examples Included:** 2 few-shot demonstration examples.
- **Output Format:** Valid JSON object.
- **Sample Run:** Rewrote *"Sales Forecasting Dashboard using Python and Excel"* into *"Developed an end-to-end sales forecasting dashboard integrating Python data modeling with Microsoft Excel reporting interfaces."*

---

# SECTION 3: IMPLEMENTATION

### 3.1 What is Built
We have developed a functional, decomposed prompt pipeline that takes unstructured resumes and job descriptions and produces an evidence-backed evaluation report. The solution includes a public web prototype, complete JSON API orchestration, and comprehensive test suites.

### 3.2 Module Status Table

| Module | What it does | Status | Notes |
| :--- | :--- | :---: | :--- |
| **1. Resume & JD Entity Extractor (`P1_PARSER`)** | Ingests raw resume and job text; extracts structured skills, experience, education; normalizes technical aliases (`JS` $\rightarrow$ `JavaScript`); categorizes requirements (`mandatory`, `preferred`). | **Working** | Low-temperature deterministic parsing ($T=0.1$); outputs strict JSON. |
| **2. Hybrid Match & Scoring Engine (`P2_SCORER`)** | Executes 6-component weighted scoring formula ($40\%$ skills, $20\%$ experience, $15\%$ projects, $10\%$ education, $10\%$ responsibilities, $5\%$ evidence); provides resume quotes for matched skills; flags missing skills with severity impacts. | **Working** | Implements the formula from the project report. Variance $<1.0$ across runs. |
| **3. Action-Oriented Resume Bullet Rewriter (`P3_REWRITER`)** | Analyzes candidate's existing experience; rewrites weak bullets into STAR-method impact statements; strictly prohibits fabricating metrics or unearned technologies. | **Working** | Uses few-shot demonstrations ($T=0.2$) for active verb generation without hallucinations. |
| **4. AI Interview Question Generator** | Generates dynamic, conversational technical and resume verification questions based on the candidate's specific skill gaps. | **Working** | Multilingual level-calibrated 5-phase planner integrated with speech transcription and live proctoring events. |
| **5. AI Job Profile Structuring Engine & Fallback** | Converts unstructured recruiter descriptions into structured `JobRequirementProfile` listings with strict Pydantic schemas, multi-key Gemini/OpenAI rotation, and an offline deterministic fallback extractor. | **Working** | Implemented in Python FastAPI (`AI/main.py`) & CLI (`AI/cli.py`); tested with 12 automated unit tests. |
| **6. Automated Test Suites (Vitest + Python unittest)** | Validates mathematical scoring, application state machine, candidate intake, authentication, and alias normalization across 55 total unit tests. | **Working** | 43 frontend tests in Vitest + 12 backend tests in Python `unittest` (100% pass rate). |

### 3.3 Prompt Iteration Log

| Version | What changed | Why it was changed | Result after the change |
| :---: | :--- | :--- | :--- |
| **v1** | **Initial Monolithic Baseline Prompt:** Single prompt asking the model to act as a resume reviewer, score out of 100, identify gaps, and suggest bullets. | Starting point submitted in Milestone 1 (Q18). | **High variance & hallucination:** Running the prompt 10 times on the same input produced scores ranging from **58/100 to 85/100** (standard deviation $\sigma = 8.6$). Feedback was generic; model hallucinated Tableau/AWS skills not in the resume; plain text was unparseable by frontend code. |
| **v2** | **Rubric Guidance & JSON Schema:** Added the 6-component weighted mathematical formula ($0.40 \times \text{Skills} + \dots$), requirement categorization (`mandatory` vs `preferred`), and enforced raw JSON output. | Subjective scoring produced arbitrary percentages with no explainability; frontend required structured data. | **Score stabilized, but format broke:** Score variance across 10 identical runs dropped to $\pm 3.2$ points. However, in **3 out of 10 runs**, the model wrapped outputs with markdown backticks (` ```json `) or conversational preamble, causing JSON parser crashes in frontend code. Single prompt was also cognitively overloaded. |
| **v3 (Final)** | **Pipeline Decomposition + Few-Shot Grounding + Zero Temperature:** Split the workflow into 3 specialized chained prompts (`P1_PARSER`, `P2_SCORER`, `P3_REWRITER`). Locked temperature to $0.1$. Added 2 graded few-shot examples and explicit negative constraints (*"Do NOT infer skills from related tools; do NOT invent metrics"*). | JSON parsing failures; need for zero hallucination and clear separation between entity extraction, mathematical evaluation, and bullet rewriting. | **100% reliable execution:** Valid JSON returned in **10 out of 10 runs** (0 parser errors). Zero hallucinated skills across all 10 candidate test cases. Score variation on identical inputs dropped to **0.0 difference** (deterministic scoring). |

---

# SECTION 4: DEMONSTRATION AND TESTING

### 4.1 Test Table (10 Diverse Inputs)

| Test no. | Input (short) | Type | Expected output | Actual output (short) | Pass / Fail |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **1** | **Role:** Data Analyst Intern<br>**Resume:** B.Tech CSE, Python, SQL, Excel Sales Dashboard | Normal | Score 70–75/100; match Python/SQL/Excel; flag missing Data Visualization; 2 STAR bullets. | Overall Score: 71/100; matched Python, SQL, Excel; flagged missing Data Visualization as critical mandatory gap. | **Pass** |
| **2** | **Role:** Frontend React Engineer<br>**Resume:** 3 yrs React 18, TypeScript, Tailwind CSS, TanStack Router, Vitest | Normal | Score 85–92/100 (High Fit); match all core frontend skills; cite bundle optimization quote. | Overall Score: 88/100; all mandatory requirements passed; cited Lighthouse score and bundle reduction quote. | **Pass** |
| **3** | **Role:** Junior Backend Developer<br>**Resume:** Python & FastAPI college project; no Docker or Redis mentioned | Normal | Score 60–68/100; match Python/FastAPI; flag missing Docker and Redis without inferring them. | Overall Score: 64/100; correctly flagged missing Docker and Redis as unfulfilled requirements; no hallucination. | **Pass** |
| **4** | **Role:** Full Stack Junior Engineer<br>**Resume:** MERN portfolio: Node.js, Express, React, MongoDB, REST APIs | Normal | Score 75–82/100; verify all 4 MERN technologies; generate improved project bullets. | Overall Score: 79/100; verified complete MERN stack; rewritten bullets emphasized automated API handling. | **Pass** |
| **5** | **Role:** Machine Learning Intern<br>**Resume:** Student with core Python scripts; no PyTorch, Pandas, or Scikit-learn | Normal | Score <50/100 (Developing Fit); pass Python syntax; flag absence of ML framework proof. | Overall Score: 46/100; marked ML frameworks missing; score justification noted lack of model training experience. | **Pass** |
| **6** | **Role:** Cloud & DevOps Intern<br>**Resume:** AWS Certified Practitioner + Docker; no Terraform or CI/CD experience | Normal | Score 65–72/100; match AWS and Docker; flag missing Terraform and automated CI/CD. | Overall Score: 67/100; normalized AWS alias; flagged Terraform gap with direct resume quote. | **Pass** |
| **7** | **Role:** QA Automation Engineer<br>**Resume:** Selenium scripts in Python, PyTest regression suite | Normal | Score 75–85/100; match Selenium, Python, PyTest; highlight test suite maintenance in bullets. | Overall Score: 81/100; verified test automation skills; produced STAR-format test coverage bullet points. | **Pass** |
| **8** | **Role:** Data Analyst Intern<br>**Resume (Hinglish):** *"Maine college me Python and SQL ka project banaya tha database ke liye, Excel me report bhi ki..."* | **Edge** | Extract Python, SQL, Excel; output professional evaluation report strictly in English. | Extracted Python, SQL, Excel correctly; however, score justification contained Hinglish phrasing (*"Candidate ne database ke liye Python use kiya..."*). | **Fail** |
| **9** | **Role:** Junior Python Developer<br>**Resume:** BA History graduate with 3 self-taught open-source Python scrapers | **Edge** | Penalize education ($10–15/100$) but award full credit for project evidence ($80–85/100$); overall score 55–60. | Overall Score: 58/100; Education score: 15/100; Project score: 85/100; accurately demonstrated modular subscoring. | **Pass** |
| **10** | **Role:** Software Engineer<br>**Resume:** Candidate types only: *"idk"* | **Invalid** | Immediate input validation error; Score 0; prompt candidate to submit real resume text. | Model evaluated *"idk"* as concise writing style; returned score 18/100 instead of triggering an invalid input exception. | **Fail** |

### 4.2 Error Analysis on Failed Tests
1. **Test 8 (Hinglish Dialect Drift):** When given code-mixed inputs, the model accurately identified technical keywords, but conversational code-mixing in the user prompt caused linguistic mirroring in the reasoning layer. *Mitigation for M3:* Add explicit pre-LLM language detection and system-level constraint: `"OUTPUT_LANGUAGE: STRICT_ENGLISH"`.
2. **Test 10 (Single-Word "idk" Hallucination):** Generative LLMs have an innate completion bias to find meaning in noise, treating *"idk"* as an ultra-concise communication style. *Resolution Implemented:* Added deterministic client-side and server-side length validation guards in `src/components/analyzer/ResumeUploadCard.tsx` and Pydantic schemas (`AI/models.py`), ensuring malformed or single-word submissions trigger clear user-facing errors before model invocation.

### 4.3 Known Limitations & Implemented Solutions
1. **Multi-Column PDF Layout Garbling:** Standard text extraction flattens columns into interleaved text lines. *Next step:* Introduce layout-aware bounding-box OCR in Milestone 3.
2. **Pipeline Latency:** Chaining 3 sequential calls takes 4.5–7.0s. *Next step:* Concurrently invoke `P2_SCORER` and `P3_REWRITER` once `P1_PARSER` resolves, reducing latency by $\sim 40\%$.
3. **Floating-Point Rounding & Calculation Determinism:** Generative models occasionally make decimal math rounding errors. *Resolution Implemented:* Offloaded weighted formula calculations ($0.40 \times S_{\text{skills}} + \dots$) to pure TypeScript functions in `src/lib/scoring.ts` (`computeComposite`) and `src/lib/ai-analyzer.ts`, using the LLM strictly for entity extraction and evidence citation.

---

# SECTION 5: REPOSITORY

### 5.1 Repository Overview
- **Repository URL:** `https://github.com/samanyu22/C9-Resume-Reviewer`
- **Visibility:** Public (Accessible to any evaluator without login)
- **Directory Structure:**
```text
C9-Resume-Reviewer/
├── README.md               # Setup instructions, live prototype link, member list
├── CHANGELOG.md            # Dated changes from Milestone 1 to Milestone 2
├── prompts/
│   ├── v1/                 # Initial Milestone 1 baseline prompt
│   ├── v2/                 # Intermediate rubric & JSON prompt
│   ├── v3/                 # Few-shot calibrated prompt draft
│   └── final/              # Final production prompts (P1_parser, P2_scorer, P3_rewriter)
├── code/                   # Application source code & API endpoints
├── test-data/              # 10 test case inputs & saved model outputs
└── docs/                   # Architecture diagrams & Milestone 2 submission PDFs
```

### 5.2 What Changed Since Milestone 1 (3–5 Lines)
- Replaced the single monolithic baseline prompt with a **3-stage prompt pipeline** (`P1`, `P2`, `P3`) featuring strict JSON output schemas.
- Implemented a **6-component mathematical scoring rubric** ($0.40 \times \text{Skills} + \dots$) eliminating inter-run score volatility.
- Created an organized repository structure with versioned prompt lineage (`prompts/v1`, `v2`, `v3`, `final`) and a dated `CHANGELOG.md`.
- Formulated a **10-case test suite** including realistic edge and invalid inputs with documented failure mode analyses.
- Implemented few-shot grounding and explicit negative constraints to achieve 100% verified zero-hallucination bullet point rewriting.

---

# SECTION 6: SUPPORTING DOCUMENT
*(The exact text of the 2-Page Technical Report submitted at Q16 is embedded here.)*

## Technical Report: AI-Powered Resume Screening and Explainable Scoring Pipeline
**Executive Summary:** In technical recruitment, manual resume screening creates severe bottlenecks, while black-box scoring algorithms alienate candidates. This report details the architecture and evaluation of our 3-stage prompt pipeline for Problem C9: AI-Powered Resume Reviewer.

**Key Technical Pillars:**
1. **Deterministic Entity Extraction (`P1_PARSER`):** Eliminates inferential errors and normalizes technical aliases (e.g. `JS` $\rightarrow$ `JavaScript`) while preserving verbatim source quotes.
2. **Explainable Multi-Criteria Scoring (`P2_SCORER`):** Implements an auditable mathematical formula ($40\%$ skills, $20\%$ experience, $15\%$ projects, $10\%$ education, $10\%$ responsibilities, $5\%$ evidence) ensuring every score point is traced back to candidate proof.
3. **Truthful Bullet Enhancement (`P3_REWRITER`):** Rewrites weak bullet points using STAR active verbs with strict negative constraints prohibiting fabricated metrics.

**Empirical Findings:** The pipeline demonstrated $100\%$ valid JSON generation over 10 consecutive runs, reduced inter-run score drift from $\pm 8.6$ to $0.0$, and successfully handled career transitions while transparently revealing failure modes on Hinglish and sub-length inputs.

---

# SECTION 7: TEAM CONTRIBUTION TABLE

| Member Name | Enrollment No. | Role | Tasks Done in Milestone 2 | Evidence (Files, Commits, Prompt IDs) | Contribution (%) |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **Samanyu Khanna** (Leader) | **S24CSEU2705** | Prompt Architecture & Lead | Designed pipeline architecture, authored `P1_PARSER` and `P2_SCORER`, locked temperature to 0.1, maintained prompt iteration log v1–v3. | `prompts/final/P1_parser.md`, `prompts/final/P2_scorer.md`, `prompts/v1/`, `prompts/v2/`, 7 commits (`e27d989`, `35448b0`, `fd491e9`, `835c7fb`, `79eb54d`, `0e46c46`) | **18%** |
| **Gurpreet Nagar** | **S24CSEU2313** | Prompt Engineering (Rewriter) | Developed `P3_REWRITER`, curated STAR-method few-shot demonstration examples, formulated anti-hallucination negative constraints. | `prompts/final/P3_rewriter.md`, `prompts/v3/P1_calibrated_fewshot.md`, 6 commits (`bdbe136`, `ec8f4cf`, `7303f78`, `d00fda4`, `3b396b6`, `c4c5d1b`) | **17%** |
| **Yuvraj Pathania** | **S24CSEU2668** | Backend & Integration | Configured AI structuring service, implemented prompt chaining orchestration, sliding-window rate limiting, and JSON error recovery. | `AI/structuring_service.py`, `AI/alias_normalization.py`, `AI/models.py`, 8 commits (`bc7c6a9`, `e54eabb`, `46e8d89`, `9c06d47`, `b004292`) | **17%** |
| **Nakshatra Gupta** | **S24CSEU2317** | Frontend & Prototype UI | Built candidate application intake interface, resume upload card, multi-step analyzing progress bar, and dark theme design token integration. | `src/components/analyzer/ResumeUploadCard.tsx`, `src/routes/jobs.$jobId.apply.tsx`, 5 commits (`b074a3f`, `0729aa1`, `c03a322`, `9b2f91a`) | **16%** |
| **Ayush Tiwari** | **S24CSEU2318** | Evaluation & Testing | Designed 10-input test suite, executed evaluations across 7 job families, analyzed edge and invalid failure modes (Hinglish & 'idk'), authored Section 4. | `test-data/test_suite.json`, `test-data/README.md`, `src/components/analyzer/AnalysisScoreCard.tsx`, 37 commits (`cd2fcd8`, etc.) | **16%** |
| **Varnit Agustya** | **S24CSEU2355** | Video Reel & Documentation | Authored 110s demonstration reel script, created Mermaid workflow and architecture diagrams, compiled 2-page Technical Report and CHANGELOG. | `docs/REEL_SCRIPT.md`, `docs/BastionBytes_TechnicalReport.*`, `docs/Milestone2_Complete_Report.*`, `CHANGELOG.md`, 7 commits (`f8a9ea2`, `233af24`, `ba7e57d`, `e2267b7`, `55b0048`) | **16%** |
| **Total** | | | | | **100%** |

*All team members have reviewed and unanimously agreed to the contribution percentages and tasks listed in this table.*
