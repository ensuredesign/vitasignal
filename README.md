# VitaSignal AI

> **Early intelligence. Private care. Healthier futures.**  
> *Future Health Digital Innovation Challenge 2026 · Fertility · Challenge 01: Male Reproductive Health*

VitaSignal AI is a responsive, bilingual, privacy-first digital front door that guides an adult through preventive reproductive health assessment, surfaces explainable evidence-grounded signals, produces an appropriate proposed care pathway, and tracks a consent-controlled simulated handoff and follow-up.

---

## Live Deployments & Repository

- **Live Production URL:** [https://vitasignal.vercel.app](https://vitasignal.vercel.app)
- **Deployment URL:** [https://vitasignal-49vupikn2-ensures-projects.vercel.app](https://vitasignal-49vupikn2-ensures-projects.vercel.app)
- **GitHub Repository:** [https://github.com/ensuredesign/vitasignal](https://github.com/ensuredesign/vitasignal)
- **Design System:** [Flip7 Card Game (DESIGNmd)](https://designmd.ai/yiujc/flip7-card-game)

---

## Key Highlights & Innovations

- **Signal → Evidence → Action → Closure:** Direct clinical explainability connecting every user finding to peer-reviewed clinical guidelines (WHO, ASRM/AUA, EAU, NHS).
- **Conservative Safety Gate:** Immediate emergency evaluation bypass for acute symptoms (sudden severe testicular pain or pain with nausea) without waiting for AI or referrals.
- **EvidenceLens Structured Extraction:** Curated synthetic laboratory reports parsed by Google Gemini with strict verbatim evidence quote verification and explicit human confirmation.
- **PrivacyVault Sovereign Sharing:** Granular field-specific sharing (none selected by default), immutable snapshots, and maximum 24-hour auto-expiration.
- **Bilingual & Culturally Sensitive (CultureBridge):** Full English and Arabic (`dir="rtl"`) support with destigmatized neutral language.
- **100% Deterministic Rule Engine:** Clinical pathways are computed by a pure TypeScript engine, never by LLM hallucination.
- **Flip7 Light Design System:** Tactile pill buttons, colored glow elevations, left-accent status cards, and pure light mode styling.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components & Route Handlers)
- **Language & Styling:** Strict TypeScript, Tailwind CSS, Lucide React
- **Design Tokens:** Flip7 Card Game Design System (`.design/DESIGN.md`)
- **Validation:** Zod schemas
- **AI Subsystem:** `@google/genai` (Gemini 3.8 Flash) with verified offline fixture replay fallback
- **Database & Security:** Supabase Postgres, Row Level Security (RLS), and `@supabase/ssr` (Dual-mode: Live Supabase + Isolated in-memory fallback)
- **Testing:** Vitest (Unit & Integration), TSX benchmark evaluation suite
- **Deployment:** Vercel

---

## Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.8-flash
APP_ENV=demo
AI_MODE=live
DEMO_ONLY=true
APP_ORIGIN=http://localhost:3000
```
*(Note: If credentials are not yet entered, VitaSignal AI operates in **Isolated Demo Mode** with offline replay so judges can evaluate all flows immediately).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Commands

```bash
# Run unit and integration tests (19 tests)
npm run test

# Run benchmark evaluation runner (100% concordance)
npm run evaluate

# Type check (0 errors)
npm run typecheck

# Production build
npm run build
```

---

## Documentation Index

- [Architecture Diagram & Data Flow](docs/ARCHITECTURE.md)
- [Clinical Safety & Decision Engine](docs/CLINICAL_SAFETY.md)
- [Security, RLS & Access Control](docs/SECURITY.md)
- [Synthetic Data Sources & Provenance](docs/DATA_SOURCES.md)
- [Automated Evaluation & Test Benchmark](docs/EVALUATION.md)
- [3-Minute Judge Demo Script](docs/DEMO_SCRIPT.md)
- [90-Day Supervised Pilot Plan](docs/PILOT_PLAN.md)
- [Submission Traceability Checklist](docs/SUBMISSION_CHECKLIST.md)
- [Build Decision History Log](docs/BUILD_LOG.md)

---

## Ethical & Regulatory Disclaimer

**VitaSignal AI is a synthetic research demonstration prototype for hackathon evaluation only.** It is not a clinical product, medical device, diagnostic tool, or validated medical service. It does not provide fertility predictions, medical diagnoses, or treatment prescriptions.
