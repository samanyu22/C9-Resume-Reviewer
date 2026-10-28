# Final Prompt 3 (P3): Action-Oriented Resume Bullet Point Rewriter

- **Prompt ID:** `P3_REWRITER`
- **Step in Workflow:** Step 3 of 3 (Actionable Feedback & Enhancement)
- **Purpose:** Rewrites weak, passive candidate resume bullet points into high-impact, STAR-aligned statements tailored to the target job description while strictly prohibiting hallucinated metrics or skills.
- **Tool & Model:** Google AI Studio / Gemini 2.5 Flash (or OpenAI GPT-4o-mini)
- **Settings:**
  - `Temperature:` 0.2 (Slight phrasing flexibility while preserving absolute truthfulness)
  - `Top-P:` 0.95
  - `Output MIME Type:` `application/json`
- **Examples Included:** 2 few-shot demonstration examples.

---

## System Prompt

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

---

## User Prompt Template

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

---

## Variable Descriptions

| Variable | Description |
| :--- | :--- |
| `{raw_bullet_points}` | The candidate's raw project or work experience bullet points extracted in Step 1. |
| `{job_title}` | The title of the target job position (e.g., "Data Analyst Intern"). |
| `{matched_and_relevant_skills}` | The list of verified skills extracted in Step 2 that are directly relevant to the target role. |

---

## Few-Shot Demonstration Examples (Included in Prompt Context)

### Example 1
- **Input Bullet:** "Worked on Python code to scrape data from websites and stored it in database."
- **Rewritten Bullet:** "Engineered automated Python data extraction scripts to collect and load web datasets into PostgreSQL for downstream analysis."
- **Rationale:** Replaced passive 'worked on' with active verb 'Engineered'; clarified tools and purpose without hallucinating metrics.

### Example 2
- **Input Bullet:** "Made an Excel sheet to show sales numbers to the team."
- **Rewritten Bullet:** "Synthesized transactional sales records in Microsoft Excel using pivot tables and summary views to support team reporting."
- **Rationale:** Strengthened phrasing and technical specificity while remaining true to student-level project work.

---

## Sample Run (Real Input & Actual Output)

### Real Input
```text
{raw_bullet_points}:
- "Built data extraction pipelines in Python and queried PostgreSQL database."
- "Sales Forecasting Dashboard using Python and Excel."

{job_title}: "Data Analyst Intern"
{matched_and_relevant_skills}: ["Python", "SQL", "PostgreSQL", "Microsoft Excel"]
```

### Actual Output
```json
{
  "enhanced_bullets": [
    {
      "original_bullet": "Built data extraction pipelines in Python and queried PostgreSQL database.",
      "rewritten_bullet": "Constructed automated Python extraction pipelines and executed complex PostgreSQL queries to prepare relational datasets for analysis.",
      "skill_highlighted": "Python & PostgreSQL",
      "action_verb_used": "Constructed",
      "improvement_rationale": "Elevated the technical impact by specifying pipeline automation and relational data preparation rather than generic database querying."
    },
    {
      "original_bullet": "Sales Forecasting Dashboard using Python and Excel.",
      "rewritten_bullet": "Developed an end-to-end sales forecasting dashboard integrating Python data modeling with Microsoft Excel reporting interfaces.",
      "skill_highlighted": "Python & Microsoft Excel",
      "action_verb_used": "Developed",
      "improvement_rationale": "Transformed a static project title into an action-oriented achievement highlighting cross-tool integration."
    }
  ],
  "general_formatting_advice": "Ensure bullet points in your final resume start with varied action verbs and explicitly mention the technical environment or data volume if known."
}
```
