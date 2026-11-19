# CHANGELOG — AI-Powered Resume Reviewer (Problem C9)
Team: BastionBytes (Batch B49-B64)
Project: AI-Powered Resume Reviewer: Resume Feedback Against a Job Description

All notable changes to the prompt pipeline, prototype architecture, and test suite since Milestone 1 are documented in this file.

---

### [Milestone 2] — 2026-11-20

#### Added
- **Multi-Step Prompt Decomposition**: Decomposed the monolithic Milestone 1 baseline prompt into 3 specialized, chained prompts:
  - `P1_PARSER`: Extracts structured requirements, normalized skills, and candidate profile in JSON.
  - `P2_SCORER`: Applies the 6-component weighted scoring formula (Skills 40%, Experience 20%, Projects 15%, Education 10%, Responsibilities 10%, Evidence 5%) and produces evidence-backed gap explanations.
  - `P3_REWRITER`: Rewrites candidate resume bullets into high-impact STAR-format statements grounded strictly in their actual experience.
- **Prompt Iteration Log (v1 → v2 → v3)**:
  - Documented quantitative and qualitative improvements across 3 major iterations.
  - Replaced ambiguous scoring criteria with an objective mathematical rubric.
  - Added few-shot examples and explicit negative constraints (`Do not infer skills from related technologies`).
- **Standardized Repository Structure**:
  - Organized `prompts/v1`, `prompts/v2`, `prompts/final` for prompt lineage tracking.
  - Created `test-data/` containing 10 diverse test inputs (including 3 edge and invalid failure cases).
  - Created `docs/` for architecture diagrams and submission reports.
- **Test Suite**:
  - Formulated 10 comprehensive test cases spanning tech internships, full-time junior roles, Hinglish inputs, and malformed inputs.
- **Supporting Technical Report**:
  - Authored a 2-page Technical Report explaining the prompt pipeline, mathematical scoring model, failure modes, and ethical AI grounding.

#### Changed
- Upgraded model inference settings: set `temperature = 0.1` and `top_p = 0.95` for deterministic evaluation consistency.
- Enforced strict JSON schema output across all prompt pipeline stages to ensure 100% downstream parsability.
- Updated project documentation to bridge Milestone 1 goals with the end-to-end recruitment platform roadmap.

---

### [Milestone 1] — 2026-10-09

#### Added
- Initial project proposal submitted for Problem Pool ID **C9**: "AI-Powered Resume Reviewer: Resume Feedback Against a Job Description".
- Single monolithic baseline prompt (`v1`) comparing resume text against a job description.
- Initial problem identification, stakeholder analysis (students, recruiters, placement cells), and literature references (NACE, Jobscan).
