# HireSense

> **AI-assisted recruitment, resume audit, and interview intelligence platform.**
> Built for Problem Pool ID **C9**: *AI-Powered Resume Reviewer: Resume Feedback Against a Job Description*.

HireSense matches candidate resumes to roles, runs role-grounded and multilingual AI technical interviews, and provides recruiters with evidence-backed reports they can audit down to verbatim resume text spans. People make every decision.

---

## Key Capabilities

- **Evidence-Backed Resume Matching**: Scores candidates across six weighted dimensions against mandatory and preferred job requirements without black-box scoring.
- **Requirement Audit Matrix**: Identifies matched skills, partial alignments, and explicit gaps classified by severity (*Critical*, *Moderate*, *Minor*).
- **AI Job Profile Structuring Microservice**: Converts raw, unstructured recruiter notes into structured job listings using Gemini, OpenAI, or an offline deterministic fallback engine.
- **Role-Grounded AI Interview Simulator**: Runs multi-phase voice/text technical interviews with real-time transcription, rubric-based scoring, and non-diagnostic proctoring signals.
- **Multilingual Support**: Supports English, Hindi, and code-mixed (Hinglish) interactions.
- **Auditable & Responsible AI**: Mandatory qualifications act as clear gates rather than hidden score penalties; protected characteristics and irrelevant personal attributes are excluded.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HireSense Web Platform                          │
│                React 19 · TanStack Start · Tailwind CSS v4             │
│        Routes: /recruiter · /student · /dashboard · /jobs/:id/apply    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       AI Structuring Service         │  │     Client Document Parser   │
│          Python 3.12+ · FastAPI      │  │        unpdf (PDF)           │
│   Gemini 3.8 / OpenAI / Local Fallback │  │       mammoth (DOCX)         │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│     Pure Scoring & Planning Engine   │  │   Supabase Cloud Platform    │
│  - 6-Component Composite Resume Fit  │  │   PostgreSQL · Row Level     │
│  - 6-Dimension Interview Rubrics     │  │   Security · User Profiles   │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

---

## Tech Stack

### Frontend & Application Layer
- **Framework**: React 19 + TanStack Start (SSR & Nitro server)
- **Routing**: TanStack Router (file-based routing under `src/routes/`)
- **Styling**: Tailwind CSS v4 with custom dark monochrome design tokens
- **Animation**: Framer Motion v14 + Lenis smooth scroll
- **Document Parsing**: `unpdf` (PDF text extraction), `mammoth` (DOCX extraction)
- **UI Components**: Radix UI primitives, Lucide React, Kokonut UI interactive cards

### Backend Intelligence & AI Microservice
- **Language**: Python 3.12+
- **API Framework**: FastAPI + Uvicorn (REST API on port `8000`)
- **Validation**: Pydantic v2 (strict JSON schema validation)
- **AI Providers**: Google Gemini API (`gemini-3.8-flash`, `gemini-3.5-flash`), OpenAI API (`gpt-4o-mini`)
- **Fallback Engine**: Local deterministic regex-based rule extractor (zero-API-key offline capability)
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security, RPC functions, Auth)

---

## Mathematical Scoring Methodology

Resume compatibility scores ($0$ to $100\%$) strictly follow the 6-component evidence-weighted formula:

$$\text{Match Score} = 0.40 \cdot S_{\text{skills}} + 0.20 \cdot S_{\text{exp}} + 0.15 \cdot S_{\text{proj}} + 0.10 \cdot S_{\text{edu}} + 0.10 \cdot S_{\text{resp}} + 0.05 \cdot S_{\text{evid}}$$

| Component | Weight | Focus Area |
| :--- | :---: | :--- |
| **Weighted Skill Match** ($S_{\text{skills}}$) | **40%** | Coverage of mandatory and preferred skills after canonical alias normalization. |
| **Experience Fit** ($S_{\text{exp}}$) | **20%** | Years of relevant industry tenure and seniority progression. |
| **Project & Role Relevance** ($S_{\text{proj}}$) | **15%** | Shipped software, architecture patterns, and demonstrable deliverables. |
| **Education & Certification Fit** ($S_{\text{edu}}$) | **10%** | Degree field, accredited coursework, and applicable technical certifications. |
| **Responsibility Semantic Match** ($S_{\text{resp}}$) | **10%** | Overlap between previous responsibilities and role requirements. |
| **Evidence Quality** ($S_{\text{evid}}$) | **5%** | Verifiable descriptive context versus keyword stuffing. |

Interview answers are scored against six rubric dimensions: **Technical Correctness** (35%), **Problem Solving** (20%), **Project Understanding** (15%), **Answer Relevance** (10%), **Communication Clarity** (10%), and **Behavioral Evidence** (10%).

---

## Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **Python**: v3.12 or higher
- **npm**: v10 or higher

### 1. Clone & Install Node Dependencies

```bash
git clone https://github.com/samanyu22/C9-Resume-Reviewer.git
cd C9-Resume-Reviewer

npm install
```

### 2. Set Up Python Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Activate on macOS/Linux
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 3. Environment Variables

Copy the example environment configuration:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key (supports comma-separated rotation) | `AIzaSy...` |
| `OPENAI_API_KEY` | OpenAI API key (optional primary provider) | `sk-...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://vglqudbftkybegdrqdec.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anonymous key | `eyJhbGciOi...` |
| `AI_SERVICE_URL` | Python FastAPI microservice endpoint | `http://127.0.0.1:8000` |

---

## Development & Execution Commands

### Web Application

```bash
npm run dev         # Start local dev server → http://localhost:8080/
npm run build       # Type-check and build production bundle
npm run preview     # Preview production build locally
npm run typecheck   # Run TypeScript compiler checks without emitting files
npm run lint        # Run ESLint checks
```

### AI Intelligence Microservice & CLI

```bash
# Start the FastAPI microservice on port 8000
npm run ai:service
# or directly via python:
python -m AI.main

# Run the CLI structuring runner directly:
python -m AI.cli --title "Frontend Lead" --company "HireSense" --desc "We require React, TypeScript, and Tailwind. 3+ years experience. Remote role." --salary "15-20 LPA"

# Verify Gemini API key rotation and credit quotas:
npm run verify:gemini
```

### Running Test Suites

```bash
# Run the complete frontend Vitest test suite (43 tests across 9 test suites)
npm test

# Run tests in watch mode
npm run test:watch

# Run the Python AI engine unit tests (12 tests)
npm run test:ai
# or:
python -m unittest discover -s AI/tests
```

---

## Project Structure

```
C9-Resume-Reviewer/
├── AI/                           # Python AI Structuring Engine
│   ├── alias_normalization.py    # Tech catalog mapping & alias normalizer
│   ├── cli.py                    # Direct CLI execution runner
│   ├── main.py                   # FastAPI server & rate limiting middleware
│   ├── models.py                 # Pydantic schemas (StructuredJobListing, etc.)
│   ├── structuring_service.py    # Multi-provider LLM pipeline + offline fallback
│   ├── requirements.txt          # Python dependencies (FastAPI, Pydantic, etc.)
│   └── tests/                    # Python unit test suite
│       └── test_structuring.py
├── prompts/                      # Milestone 1 & 2 prompt lineage
│   ├── v1/                       # Initial baseline prompt
│   ├── v2/                       # Two-stage prompt
│   └── final/                    # Multi-step decomposed pipeline (P1, P2, P3)
├── test-data/                    # Benchmark test cases & resumes
│   └── test_suite.json           # 10 diverse validation cases with expected outputs
├── scripts/                      # Developer and diagnostic utilities
│   ├── verify-gemini-keys.py     # Gemini key credit & quota checker
│   └── generate-favicons.py     # High-resolution branding asset generator
├── supabase/                     # Database migrations & schemas
│   └── migrations/               # PostgreSQL DDL and RLS policies
├── src/                          # Frontend application source
│   ├── components/
│   │   ├── analyzer/             # Resume upload, matrix, and scoring cards
│   │   ├── hs/                   # HireSense marketing landing sections
│   │   ├── interview/            # Live AI interview room and audio recorder
│   │   └── ui/                   # Design system primitives (SmoothInput, etc.)
│   ├── hooks/                    # Custom React hooks (audio, media, motion)
│   ├── lib/
│   │   ├── ai-analyzer.ts        # Deterministic and LLM resume scoring
│   │   ├── ai-interview.ts       # Interview question generator and evaluator
│   │   ├── ai-listing.ts         # Bridge to Python AI structuring service
│   │   ├── document-parser.ts    # PDF / DOCX text extractor
│   │   ├── interview-planner.ts  # Level-calibrated 5-phase interview planner
│   │   ├── scoring.ts            # Pure rubric & composite score calculation
│   │   └── supabase.ts           # Supabase client & username resolution
│   ├── routes/                   # File-based TanStack Router routes
│   │   ├── index.tsx             # Landing page
│   │   ├── recruiter.tsx         # Recruiter job management & applicant review
│   │   ├── student.tsx           # Candidate dashboard & applications
│   │   └── jobs.$jobId.apply.tsx # Resume intake & AI interview session
│   ├── styles.css                # Tailwind CSS v4 design tokens
│   └── test/                     # Vitest test files
│       ├── ai-interview.test.ts
│       ├── applications.test.ts
│       ├── auth-login.test.ts
│       ├── interview-planner.test.ts
│       └── scoring.test.ts
├── package.json                  # Node dependencies & npm scripts
├── requirements.txt              # Root Python dependencies pointer
├── tsconfig.json                 # TypeScript compiler configuration
└── vitest.config.ts              # Vitest test runner configuration
```

---

## Context Documentation

| Document | Purpose |
| :--- | :--- |
| [GEMINI.md](file:///c:/Users/Nakshatra%20Gupta/OneDrive/Documents/C9-Resume-Reviewer/GEMINI.md) | Single source of truth for product facts, brand voice, and engineering specs |
| [DESIGN.md](file:///c:/Users/Nakshatra%20Gupta/OneDrive/Documents/C9-Resume-Reviewer/DESIGN.md) | Geometry, token scale, and visual component rules |
| [resume_fit_scoring_methodology.md](file:///c:/Users/Nakshatra%20Gupta/OneDrive/Documents/C9-Resume-Reviewer/resume_fit_scoring_methodology.md) | Full mathematical breakdown of the 6-dimension scoring formula |
| [CHANGELOG.md](file:///c:/Users/Nakshatra%20Gupta/OneDrive/Documents/C9-Resume-Reviewer/CHANGELOG.md) | Version history and milestone progress log |

---

## Responsible AI Standards

1. **Human in the Loop**: AI provides evidence, candidate interview transcripts, and structured metrics. Recruiters make all hiring, shortlisting, and rejection decisions.
2. **Auditable Attribution**: Every score links directly back to verbatim evidence in the resume or interview transcript.
3. **Objective Evaluation**: No personality classification, truthfulness detection, or psychological scoring from camera gaze or speech tone. Proctoring reports observable operational events only.
4. **No Inferred Competencies**: The matching model never assumes proficiency in an unmentioned tool solely because an adjacent technology was mentioned.
