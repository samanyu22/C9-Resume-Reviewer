# TECHNICAL REPORT
## AI-Powered Resume Screening and Explainable Scoring Pipeline
**Course:** SCSE4041 — Prompt Engineering | **Milestone:** 2  
**Team Name:** BastionBytes | **Problem Pool ID:** C9  
**Team Members:** Samanyu Khanna (Lead), Yuvraj Pathania, Ayush Tiwari, Varnit Agustya, Nakshatra Gupta, Gurpreet Nagar  
**Institution:** Bennett University, Greater Noida  

---

### 1. Abstract & Executive Summary
In modern technical recruitment, manual resume screening creates severe operational bottlenecks and arbitrary candidate rejections. Applicants receive opaque rejection notices without actionable feedback, while recruiters struggle to evaluate high volumes of unstructured resumes against nuanced technical criteria. 

This report presents an auditable, prompt-engineered pipeline for **Problem C9: AI-Powered Resume Reviewer**. Moving beyond single-prompt generative approaches that suffer from hallucinations and score instability, our architecture decomposes recruitment evaluation into a deterministic three-stage pipeline: (1) **Entity Extraction & Alias Normalization** (`P1_PARSER`), (2) **Weighted Multi-Factor Scoring & Evidence Grounding** (`P2_SCORER`), and (3) **Truthful STAR-Method Bullet Enhancement** (`P3_REWRITER`). Evaluated across a 10-case test suite including edge and invalid inputs, the pipeline achieved 100% JSON parsing reliability, dropped score variance across repeated runs to $\Delta = 0.0$, and strictly prohibited hallucinated credentials.

---

### 2. Architecture & Prompt Pipeline Design

Rather than treating language models as black-box decision makers, our system enforces a deterministic separation of concerns:

```
[Raw Resume + Target JD]
         │
         ▼
┌─────────────────────────────────┐
│  Stage 1: P1_PARSER (Temp: 0.1) │  ──> Standardizes aliases (e.g., 'JS' → 'JavaScript')
│  Entity & Requirement Extractor │  ──> Types requirements ('mandatory' vs 'preferred')
└─────────────────────────────────┘
         │ (Structured JSON Profile)
         ▼
┌─────────────────────────────────┐
│  Stage 2: P2_SCORER (Temp: 0.1) │  ──> Calculates 6-part weighted formula
│  Hybrid Match & Evidence Engine │  ──> Extracts exact textual proof quotes
└─────────────────────────────────┘
         │ (Match Report & Skill Gaps)
         ▼
┌─────────────────────────────────┐
│ Stage 3: P3_REWRITER (Temp: 0.2)│  ──> Rewrites weak bullets into STAR format
│ Action-Oriented Bullet Rewriter │  ──> Negative constraint: ZERO fabricated metrics
└─────────────────────────────────┘
         │
         ▼
[Auditable Candidate Match Report + Enhanced Bullets]
```

#### Mathematical Scoring Formulation
To prevent arbitrary scores, `P2_SCORER` implements a multi-criteria weighted scoring formula:
$$\text{Match Score} = 0.40 \cdot S_{\text{skills}} + 0.20 \cdot S_{\text{exp}} + 0.15 \cdot S_{\text{proj}} + 0.10 \cdot S_{\text{edu}} + 0.10 \cdot S_{\text{resp}} + 0.05 \cdot S_{\text{evid}}$$

Where:
- $S_{\text{skills}}$: Evaluates mandatory ($75\%$ weight) and preferred ($25\%$ weight) competencies. Missing a mandatory skill gates the candidate below the high-fit threshold.
- $S_{\text{exp}}$ & $S_{\text{proj}}$: Measure tenure and project relevance against role seniority.
- $S_{\text{evid}}$: Evaluates whether claims are substantiated by quantifiable metrics or active verbs.

---

### 3. Model Selection, Hyperparameters, and Calibration

| Stage | Primary Model | Temperature | Top-P | Output Mode | Optimization Strategy |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **P1: Extractor** | Gemini 2.5 Flash | `0.1` | `0.95` | `application/json` | Low temperature enforces literal text extraction; canonical alias mapping dictionary in system context. |
| **P2: Scorer** | Gemini 2.5 Flash | `0.1` | `0.95` | `application/json` | 2 few-shot calibration examples (one high fit, one borderline) eliminate inter-run scoring variance. |
| **P3: Rewriter** | Gemini 2.5 Flash | `0.2` | `0.95` | `application/json` | Negative few-shot examples demonstrate active verbs while strictly forbidding unstated tools/numbers. |

---

### 4. Empirical Test Results & Error Analysis

The pipeline was validated against a 10-input test suite covering diverse roles (Data Analyst, Frontend, Backend, ML, DevOps, QA) and non-standard inputs:

- **Normal Cases (7/7 Passed):** Consistently extracted required frameworks, normalized abbreviations, and generated STAR-compliant bullets without drift.
- **Career Transition Edge Case (Passed):** A candidate with a BA in History applying for a Python role received an education score of $15/100$, but full credit ($85/100$) for self-taught GitHub scrapers, validating modular subscoring.
- **Hinglish Edge Case (Failed):** In Test 8 (*"Maine Python me project banaya tha..."*), `P1_PARSER` extracted skills correctly, but `P2_SCORER` mirrored the input dialect in its justification text instead of maintaining formal English.
- **Invalid Single-Word Input (Failed):** In Test 10 (Input: *"idk"*), the LLM exhibited positive completion bias, awarding $18/100$ and complimenting "concise communication" rather than failing gracefully.

---

### 5. Ethical AI, Bias Mitigation, and Limitations

1. **PII and Protected Attributes:** The extraction prompt strictly isolates technical entities, discarding gender, age, religion, and demographic markers before evaluation.
2. **Deterministic Pre-Validation:** To fix the Test 10 failure, production builds require a client-side length check ($\ge 150$ characters) prior to LLM invocation.
3. **Language Normalization:** To prevent dialect mirroring (Test 8), a strict system constraint (`OUTPUT_LANGUAGE: STRICT_EN_US`) is mandated for Milestone 3.

---

### 6. Conclusion
Decomposing resume evaluation into specialized, low-temperature prompt stages resolves the score volatility and hallucinations common in single-prompt LLM wrappers. The resulting architecture provides recruiters with an explainable audit trail and offers students truthful, actionable resume improvements.
