# Prompt Version 3 (v3) — Calibrated Few-Shot & Pipeline Separation

- **Date:** 2026-11-12
- **Author:** Samanyu Khanna, Varnit Agustya, Ayush Tiwari (BastionBytes)
- **Role / Task:** Split into specialized prompts (Extractor, Scorer, Rewriter), locked temperature to 0.1, added few-shot demonstrations, and added anti-hallucination rules.
- **Model / Tool:** Gemini 2.5 Flash / GPT-4o-mini (Temperature: 0.1 - 0.2)

---

## What Changed from v2

1. **Pipeline Separation:** Split the single complex v2 prompt into 3 discrete stages:
   - `P1_PARSER` for high-precision entity extraction and alias mapping (e.g. `JS` -> `JavaScript`).
   - `P2_SCORER` for deterministic mathematical weighting ($0.40 \times \text{Skills} + 0.20 \times \text{Experience} + \dots$).
   - `P3_REWRITER` for STAR-format bullet point improvement.
2. **Few-Shot Examples Added:** Provided 2 graded input-output examples directly in the context.
3. **Negative Constraints:** Explicitly added:
   - *"Do NOT infer skills because related technologies are mentioned."*
   - *"Do NOT invent numbers, percentages, or tools not in the candidate's actual text."*
4. **Sampling Parameter Fix:** Lowered temperature from `0.3` to `0.1` for parser and scorer, and `0.2` for rewriter.

---

## Evaluation & Observed Results

- **JSON Reliability:** In **10 out of 10 runs**, valid JSON was returned without markdown tags or parser crashes.
- **Zero Hallucination:** Tested on 10 candidate resumes with varying skill gaps; the model did not fabricate any tools or unearned credentials.
- **Score Replicability:** Variance on identical inputs dropped to **0.0 score difference** across repeated runs due to low temperature and strict mathematical formulation.
- **Status:** Promoted to production as `prompts/final/` (`P1_parser.md`, `P2_scorer.md`, `P3_rewriter.md`).
