# Test Data Suite — AI-Powered Resume Reviewer (Problem C9)

This folder contains the complete test dataset used to evaluate the 3-step prompt pipeline (`P1_PARSER`, `P2_SCORER`, `P3_REWRITER`).

## Test Suite Overview

- **Total Test Cases:** 10
- **Normal Test Cases:** 7 (Diverse technical job families & student profiles)
- **Edge Cases:** 2 (Code-mixed Hinglish input, Career transition / non-CS degree)
- **Invalid Cases:** 1 (Single-word malformed input "idk")
- **Pass / Fail Breakdown:** 8 Passes, 2 Fails (Honest failure analysis documented)

---

## Summary Test Table

| Test No. | Role / Input Summary | Type | Expected Output | Actual Output | Status |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **1** | Data Analyst Intern (Python, SQL, Excel) | Normal | Score ~70-75, match Python/SQL, flag missing Data Viz | Score: 71/100, matched Python & SQL, flagged Data Viz | **Pass** |
| **2** | Frontend Engineer (React, TS, Tailwind) | Normal | Score 85-92, high fit, match all mandatory skills | Score: 88/100, identified all skills, cited GitHub stars | **Pass** |
| **3** | Backend Developer (FastAPI, Docker, PostgreSQL, Redis) | Normal | Score 60-70, match Python/FastAPI, flag missing Redis/Docker | Score: 64/100, flagged missing Redis & Docker | **Pass** |
| **4** | Full Stack Junior Developer (Node.js, Express, MongoDB) | Normal | Score 75-82, verify MERN stack skills and project fit | Score: 78/100, verified MERN stack, generated STAR bullets | **Pass** |
| **5** | Machine Learning Intern (PyTorch, Pandas, Scikit-learn) | Normal | Score <50 (Developing Fit), candidate only has core Python | Score: 46/100, correctly flagged lack of ML framework proof | **Pass** |
| **6** | Cloud & DevOps Intern (AWS, Docker, CI/CD, Terraform) | Normal | Score 65-75, match Docker/AWS, flag missing Terraform | Score: 67/100, flagged missing Terraform with source quote | **Pass** |
| **7** | QA Automation Engineer (Selenium, Cypress, Python) | Normal | Score 75-85, verify test automation skills | Score: 79/100, verified Selenium & Python automation | **Pass** |
| **8** | Candidate resume written in Hinglish ("Maine Python me project banaya tha...") | Edge | Extract Python/SQL, output report in formal professional English | Extracted skills accurately, but output commentary in Hinglish rather than English | **Fail** |
| **9** | Career Pivot: BA History graduate with self-taught Python projects | Edge | 0% education score, but full credit for technical project evidence | Education score 10/100, project score 85/100, overall score 58/100 | **Pass** |
| **10** | Malformed input: Candidate enters "idk" as resume text | Invalid | System rejection: Error code, Score 0, prompt to submit real resume | Prompt hallucinated "Candidate demonstrates concise writing style", returned score 18/100 | **Fail** |

See `test_suite.json` for the full inputs and raw LLM JSON outputs.
