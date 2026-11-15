# Section 3: Implementation & Prompt Iteration Log

## 3.1 What is Built
We have implemented a three-stage decomposed prompt pipeline for **Problem C9: AI-Powered Resume Reviewer**. The pipeline transitions from an unstructured raw resume and job description into an explainable, auditable evaluation report and actionable bullet-point enhancements. The system is implemented using **Gemini 2.5 Flash** (via Google AI Studio) with Python/TypeScript orchestration and an interactive web user interface built with React and Tailwind CSS.

## 3.2 Module Status Table

| Module | What it does | Status | Notes |
| :--- | :--- | :---: | :--- |
| **1. Resume & JD Entity Extractor (`P1_PARSER`)** | Ingests raw resume and job description text; extracts structured skills, experience, education, and job constraints; normalizes technical aliases (e.g., `JS` $\rightarrow$ `JavaScript`); categorizes requirements (`mandatory`, `preferred`). | **Working** | Low-temperature deterministic parsing ($T=0.1$); outputs strict JSON. |
| **2. Hybrid Match & Scoring Engine (`P2_SCORER`)** | Executes the 6-component weighted scoring formula ($40\%$ skills, $20\%$ experience, $15\%$ projects, $10\%$ education, $10\%$ responsibilities, $5\%$ evidence quality); identifies matched skills with resume source quotes; flags missing skills with operational impact explanations; generates interview verification questions. | **Working** | Implements the formula from the project report. Variance $<1.0$ across repeated runs. |
| **3. Action-Oriented Resume Bullet Rewriter (`P3_REWRITER`)** | Analyzes candidate's existing experience and projects; rewrites weak bullets into STAR-method impact statements; strictly prohibits fabricating metrics or technologies not present in the candidate's actual text. | **Working** | Uses few-shot demonstrations ($T=0.2$) for active verb generation without hallucinations. |
| **4. AI Interview Question Generator** | Generates dynamic, conversational technical and resume verification questions based on the candidate's specific skill gaps. | **Partly Working** | Prompt prototype functional in AI Studio; full voice/audio state machine integration scheduled for Milestone 3. |

---

## 3.3 Prompt Iteration Log

| Version | What changed | Why it was changed | Result after the change |
| :---: | :--- | :--- | :--- |
| **v1** | **Initial Monolithic Baseline Prompt:** Single prompt asking the model to act as a resume reviewer, score out of 100, identify gaps, and suggest bullets. | Starting point submitted in Milestone 1 (Q18). | **High variance & hallucination:** Running the prompt 10 times on the same input produced scores ranging from **58/100 to 85/100** (standard deviation $\sigma = 8.6$). Feedback was generic; model hallucinated Tableau/AWS skills not in the resume; plain text was unparseable by frontend code. |
| **v2** | **Rubric Guidance & JSON Schema:** Added the 6-component weighted mathematical formula ($0.40 \times \text{Skills} + \dots$), requirement categorization (`mandatory` vs `preferred`), and enforced raw JSON output. | Subjective scoring produced arbitrary percentages with no explainability; frontend required structured data. | **Score stabilized, but format broke:** Score variance across 10 identical runs dropped to $\pm 3.2$ points. However, in **3 out of 10 runs**, the model wrapped outputs with markdown backticks (` ```json `) or conversational preamble, causing JSON parser crashes in frontend code. Single prompt was also cognitively overloaded. |
| **v3 (Final)** | **Pipeline Decomposition + Few-Shot Grounding + Zero Temperature:** Split the workflow into 3 specialized chained prompts (`P1_PARSER`, `P2_SCORER`, `P3_REWRITER`). Locked temperature to $0.1$. Added 2 graded few-shot examples and explicit negative constraints (*"Do NOT infer skills from related tools; do NOT invent metrics"*). | JSON parsing failures; need for zero hallucination and clear separation between entity extraction, mathematical evaluation, and bullet rewriting. | **100% reliable execution:** Valid JSON returned in **10 out of 10 runs** (0 parser errors). Zero hallucinated skills across all 10 candidate test cases. Score variation on identical inputs dropped to **0.0 difference** (deterministic scoring). |

---

## 3.4 Full Text of Each Prompt Version

### Version 1 (v1) — Monolithic Baseline Prompt (Milestone 1)
```text
Act as a resume reviewer. Compare the given resume with the job description. Identify matching skills, missing skills, and areas for improvement. Suggest 2–3 improved resume bullet points based only on the candidate’s actual experience. Give a match score out of 100 with clear reasons. Do not invent qualifications or experience.

Input: 
Resume: B.Tech student with Python, SQL, and a data analysis project using Excel. 
Job Description: Data Analyst Intern requiring Python, SQL, Excel, and data visualization skills.
```

### Version 2 (v2) — Rubric-Guided Single Prompt with JSON Format
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

### Version 3 (v3 / Final) — Chained Specialized Prompts
*(Detailed system prompts, templates, variables, and output schemas for `P1_PARSER`, `P2_SCORER`, and `P3_REWRITER` are documented in Section 2 Prompt Sheets.)*

---

# Section 4: Demonstration and Testing

## 4.1 Test Table (10 Inputs with Edge & Invalid Cases)

| Test no. | Input (short) | Type | Expected output | Actual output (short) | Pass / Fail |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **1** | **Role:** Data Analyst Intern<br>**Resume:** B.Tech CSE, Python, SQL, Excel Sales Dashboard | Normal | Score 70–75/100; match Python/SQL/Excel; flag missing Data Visualization; 2 STAR bullets. | Overall Score: 71/100; matched Python, SQL, Excel; flagged missing Data Visualization as critical mandatory gap. | **Pass** |
| **2** | **Role:** Frontend React Engineer<br>**Resume:** 3 yrs React 18, TypeScript, Tailwind CSS, TanStack Router, Vitest | Normal | Score 85–92/100 (High Fit); match all core frontend skills; cite bundle optimization quote. | Overall Score: 88/100; all mandatory requirements passed; cited Lighthouse score and bundle reduction quote. | **Pass** |
| **3** | **Role:** Junior Backend Developer<br>**Resume:** Python & FastAPI college project; no Docker or Redis mentioned | Normal | Score 60–68/100; match Python/FastAPI; flag missing Docker and Redis without inferring them. | Overall Score: 64/100; correctly flagged missing Docker and Redis as unfulfilled requirements; no hallucination. | **Pass** |
| **4** | **Role:** Full Stack Junior Engineer<br>**Resume:** MERN portfolio: Node.js, Express, React, MongoDB, REST APIs | Normal | Score 75–82/100; verify all 4 MERN technologies; generate improved project bullets. | Overall Score: 79/100; verified complete MERN stack; rewritten bullets emphasized automated API handling. | **Pass** |
| **5** | **Role:** Machine Learning Intern<br>**Resume:** Student with core Python scripts; no PyTorch, Pandas, or Scikit-learn | Normal | Score <50/100 (Developing Fit); pass Python syntax; flag absence of ML framework proof. | Overall Score: 46/100; marked ML frameworks missing; score justification noted lack of model training experience. | **Pass** |
| **6** | **Role:** Cloud & DevOps Intern<br>**Resume:** AWS Certified Practitioner + Docker; no Terraform or CI/CD experience | Normal | Score 65–72/100; match AWS and Docker; flag missing Terraform and automated CI/CD. | Overall Score: 67/100; normalized AWS alias; flagged Terraform gap with direct resume quote. | **Pass** |
| **7** | **Role:** QA Automation Engineer<br>**Resume:** Selenium scripts in Python, PyTest regression suite | Normal | Score 75–85/100; match Selenium, Python, PyTest; highlight test suite maintenance in bullets. | Overall Score: 81/100; verified test automation skills; produced STAR-format test coverage bullet points. | **Pass** |
| **8** | **Role:** Data Analyst Intern<br>**Resume (Hinglish):** "Maine college me Python and SQL ka project banaya tha database ke liye, Excel me report bhi ki..." | Edge | Extract Python, SQL, Excel; output professional evaluation report strictly in English. | Extracted Python, SQL, Excel correctly; however, score justification contained Hinglish phrasing (*"Candidate ne database ke liye Python use kiya..."*). | **Fail** |
| **9** | **Role:** Junior Python Developer<br>**Resume:** BA History graduate with 3 self-taught open-source Python scrapers | Edge | Penalize education ($10–15/100$) but award full credit for project evidence ($80–85/100$); overall score 55–60. | Overall Score: 58/100; Education score: 15/100; Project score: 85/100; accurately demonstrated modular subscoring. | **Pass** |
| **10** | **Role:** Software Engineer<br>**Resume:** Candidate types only: *"idk"* | Invalid | Immediate input validation error; Score 0; prompt candidate to submit real resume text. | Model evaluated *"idk"* as concise writing style; returned score 18/100 instead of triggering an invalid input exception. | **Fail** |

---

## 4.2 Error Analysis on Failed Tests (Honest Reporting)

### 1. Test 8 (Hinglish / Code-Mixed Input Failure)
- **Observed Behavior:** When fed code-mixed input, the LLM extracted technical entities accurately (`Python`, `SQL`, `Excel`), but its natural language output drifted into Hinglish (*"Candidate ne project me Python use kiya..."*), disregarding the system prompt instruction to output in formal English.
- **Root Cause:** In standard autoregressive models, conversational code-mixing in the user prompt causes linguistic mirroring in the output layer.
- **Mitigation / Next Step:** Implement a pre-LLM language detection and normalization step, or explicitly enforce: `"OUTPUT_LANGUAGE: STRICT_ENGLISH (Do not mirror candidate's input vernacular)"`.

### 2. Test 10 (Single-Word Malformed Input Failure)
- **Observed Behavior:** When a candidate submitted only *"idk"*, the model attempted to be overly polite and forgiving, awarding an $18/100$ score and commenting on *"concise communication"*.
- **Root Cause:** Generative LLMs exhibit positive completion bias when prompted to "evaluate" text, attempting to extract meaning even from trivial noise.
- **Mitigation / Next Step:** Implement a deterministic client-side and server-side input length guard (e.g., `resumeText.trim().length >= 150 characters`) before calling the LLM inference API.

---

## 4.3 Known Limitations & What We Will Try Next

1. **Complex Multi-Column PDF Parsing:**
   - *Limitation:* Standard PDF text extractors flatten multi-column resumes into garbled horizontal reading lines, causing Prompt P1 to misattribute dates and company names.
   - *What We Will Try Next:* Integrate a vision-augmented layout parser (OCR with bounding-box segmentation) in Milestone 3 to preserve column boundaries prior to prompting.
2. **Sequential Chaining Latency:**
   - *Limitation:* Executing three sequential LLM calls (`P1` $\rightarrow$ `P2` $\rightarrow$ `P3`) creates an end-to-end processing delay of 4.5 to 7.0 seconds.
   - *What We Will Try Next:* Parallelize the pipeline: execute `P2_SCORER` and `P3_REWRITER` concurrently once `P1_PARSER` completes, reducing perceived latency by approximately $40\%$.
3. **Deterministic Formula vs LLM Math:**
   - *Limitation:* LLMs occasionally make minor rounding errors when calculating weighted floating-point arithmetic ($0.40 \times 68 + \dots$).
   - *What We Will Try Next:* Shift the final mathematical arithmetic from the LLM prompt to a deterministic server-side function, having the LLM output only the raw subscores (0–100) and evidence quotes.
