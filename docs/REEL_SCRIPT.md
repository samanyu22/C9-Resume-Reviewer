# DEMO REEL SCRIPT (90–150 Seconds)
## Project: AI-Powered Resume Reviewer (Problem C9)
**Target Length:** ~110 seconds  
**Speaker:** Varnit Agustya (or teammate)  
**Format:** Screen recording with voiceover (No camera required, horizontal or vertical)

---

### Part 1: Problem Statement (~15 seconds | 0:00 – 0:15)
- **Visual on Screen:** Show student resume and a long, messy Job Description on screen.
- **Voiceover:**
  > *"When college students apply for internships and placements, they struggle to know if their resumes truly match job requirements. Automated screening tools often reject candidates without any explanation. Our project, BastionBytes' AI-Powered Resume Reviewer, solves this with an explainable, prompt-engineered pipeline that provides auditable match scores and truthful bullet point feedback."*

---

### Part 2: The Prompt Experiment & Iteration (~35 seconds | 0:15 – 0:50)
- **Visual on Screen:** Show split screen:
  - Left: `prompts/v1/P1_baseline.md` (Milestone 1 baseline prompt & vague output).
  - Right: `prompts/final/` showing the 3 decomposed prompts (`P1_PARSER`, `P2_SCORER`, `P3_REWRITER`).
- **Voiceover:**
  > *"In Milestone 1, our baseline was a single monolithic prompt. But when we tested it 10 times, the score fluctuated wildly between 58 and 85 out of 100, and it hallucinated tools the candidate never mentioned.*
  > 
  > *For Milestone 2, we decomposed the task into three specialized, low-temperature prompt stages:*
  > *First, P1 parses entities and normalizes tech aliases like 'JS' to 'JavaScript'.*
  > *Second, P2 computes an objective 6-component weighted match score with exact resume evidence quotes.*
  > *And third, P3 rewrites weak bullets into STAR-method impact statements with strict anti-hallucination rules. This brought score drift to zero and achieved 100% reliable JSON output."*

---

### Part 3: Live Working Demonstration (~45 seconds | 0:50 – 1:35)
- **Visual on Screen:** 
  - Open the live web app (`/jobs/demo-job/apply` or Streamlit/AI Studio).
  - Paste the sample resume (Aarav Sharma - Data Analyst Intern).
  - Click **Analyze Resume**.
  - Show the progress bar, then scroll down to the generated **Analysis Score Card**:
    - Highlight the **71/100 Overall Score**.
    - Show the **Score Breakdown**: Skills 68, Experience 75, Projects 70.
    - Show the **Missing Skills**: "Data Visualization (Mandatory Gap)".
    - Show the **Rewritten Bullet Points**: Point to the original vs improved STAR bullet point.
- **Voiceover:**
  > *"Here is the live prototype running on a real Data Analyst Intern role. We upload candidate Aarav's resume. As the pipeline runs, P1 extracts the skills, P2 evaluates the fit against the job profile, and P3 enhances the resume.*
  > 
  > *Notice the result: The candidate gets a 71/100. It doesn't just give a score — it clearly shows Python and SQL matched, but flags Data Visualization as a critical missing requirement. Below, it rewrites the candidate's sales dashboard bullet point into an active, achievement-oriented statement without inventing any false metrics."*

---

### Part 4: Progress & Milestone 3 Plan (~15 seconds | 1:35 – 1:50)
- **Visual on Screen:** Show GitHub repository commit history and the architecture diagram showing the future AI Interview module.
- **Voiceover:**
  > *"All three prompt modules are fully functional with a 10-case test suite documented in our public GitHub repository. For Milestone 3, we will integrate adaptive AI mock interview questions generated directly from these identified skill gaps. Thank you!"*
