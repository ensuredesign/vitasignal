# VitaSignal AI — Antigravity Master Build Prompt

**Companion file:** `VitaSignal_AI_PRD.md` (or `PRD.md` after renaming).  
**How to use:** create/open a local `vitasignal-ai` workspace in Google Antigravity. Put the two Markdown files in the workspace root. Paste the text between START and END into the agent conversation. Keep the PRD available throughout implementation. Use review/approval for terminal commands affecting external services. This prompt requests real code and tests, not UI images or a mock-up.

---

## START — copy from here

You are the lead implementation agent for **VitaSignal AI**, a solo entrant's submission for Future Health Digital Innovation Challenge 2026, Fertility — Challenge 01 (Male Reproductive Health). Act as an experienced award-winning hackathon engineer, healthcare software architect, clinical safety-conscious UX designer, Supabase security engineer, AI engineer, QA lead and skeptical competition judge. You are not a clinician. Do not claim medical validation.

### Mission and operating instructions

Read `VitaSignal_AI_PRD.md` (or `PRD.md`) in the workspace completely, before changing code. Treat the PRD as the product source of truth, this prompt as execution guidance, and safety restrictions as non-negotiable. Build a real, working, mobile-first app, not a static landing page. A judge must be able to experience the complete fictional care journey. Time is constrained; the public prototype deadline is 20 November 2026. Ask the human to verify the portal cutoff and rules, but proceed locally with the defined P0 scope while awaiting necessary external credentials. Do not invent remaining time. Do not ask unnecessary design questions. If existing files are present, inspect them and preserve unrelated changes; do not overwrite or delete an existing repo/database. Use small incremental changes and test as you go. Maintain `docs/BUILD_LOG.md` with implementation decisions, commands, actual verification evidence, failures and unfinished items. Never mark a task done merely because it was planned.

Before coding, produce a short actionable implementation plan and checklist mapping P0 requirements to work units, then begin implementing G0/G1 immediately in the same workspace. Do not stop after the plan. Continue through the gates in dependency order, testing at each. Do not attempt P1 or P2 until every P0 release gate passes. If a gate is blocked by credentials, implement/test its pure logic and use an explicitly labelled local development mode or fixture replay as applicable; return to integration when the operator provides credentials. Never quietly substitute mock results for live cloud functions.

### Non-negotiable product boundaries

- Public demo is fictional adult data ONLY. Do not offer real patient self-assessment, free-text health input, live personal report upload, real booking, real clinician advice, fertility probability, diagnosis or medication recommendations. Use curated sample reports and predefined synthetic options. Every screen involving case data visibly says “Synthetic demo • Not for medical use”.
- Never infer fertility or absence of disease. No “fertility score”, “low risk means fertile”, treatment recommendation, or fabricated test thresholds. Distinguish a reported observation from a finding and proposed next action. Always display missing/unknown data.
- Deterministic rules, not AI, control routes. Sudden severe testicular pain or testicular pain with nausea/vomiting triggers immediate urgent screen, bypasses normal questions, AI and referral. Missing safety answers trigger clarify-safety, never reassurance. Server independently recomputes gate before extraction/evaluation/share. Use NHS-linked static safety guidance without personal medical claims. Do not downgrade urgency based on an AI response. Build a conservative route precedence from PRD section 6, including secondary routes only for nonurgent results.
- Only source-linked, schema-validated extraction from allowlisted synthetic lab report text. AI cannot access arbitrary documents, browse, call tools, invent values or URLs, diagnose, triage or control application state. Treat report as untrusted data. Use exact quote + field/value/unit association checks and explicit confirmation. No actual PHI, prompt logs or real records in this repository/cloud.
- Consent is explicit, separate for synthetic processing, external AI and selected-field sharing. Decline AI leaves the core flow usable. Reviewer in P0 is an owner-only **simulated coordinator** reading shared snapshot projection; do not claim real clinician access. All actions are simulated. Expiry, revoke and changes to underlying assessment invalidate sharing immediately. Urgent/unknown safety cannot share routine care. Delete removes own data, ends session, and documents retention limitations.
- Security is mandatory even though records are synthetic. Verify every session/owner and revision, enforce RLS and private/no-store responses. Never expose service-role or Gemini keys to browser. Never allow direct table/RPC clients to forge derived state or self-select a role. No health tracking/ads analytics SDK. No claims of HIPAA, UAE/ADHICS, GDPR, medical device or clinical compliance. Production deployment is a separate review gate.
- All metrics are calculated from actual test runs, with denominators and explicit input type/mode. No fabricated users, clinical accuracy, revenue, testimonials, appointments, pilot partners or completed integrations. If something is not measured, display “Not measured”. Distinguish actual live AI, replay, manual and failed modes; distinguish rule concordance and synthetic test coverage from clinical efficacy.

### Architecture and engineering requirements

Use a single modern full-stack Next.js App Router application compatible with Vercel, strict TypeScript, Tailwind CSS, shadcn/ui (select only needed components), Lucide icons, Zod, Supabase Postgres/Auth/SSR, maintained `@google/genai` SDK, Vitest and Playwright. Recharts optional only when measured results justify charts. Use stable compatible dependency versions, Node LTS supported on Vercel, one npm lockfile. Do not add separate Python/FastAPI servers, microservices, vector search, unnecessary auth providers or paid services. Use server route handlers with Node runtime and clear service boundaries. Isolate clinical engine into a pure unit-testable module. Use current official docs when needed; do not assume dated SDK examples. No dependency on unsupported model name: GEMINI_MODEL configured explicitly, confirm availability. Use server-side timeouts and rate limits with clear errors and fallback.

Follow PRD section 8 folder structure. Use accessible shared UI components, mobile first, good contrast, keyboard support and focus, `lang`/`dir` for English/Arabic, localised dictionaries (no live model translations). Brand palette navy #14283F, teal #087E83, off-white #F6F8FA, slate #34465A; red only urgent. Avoid alarming scores, stigma and assumptions about marriage or conception. Use a neutral discreet exit and no sensitive browser title/URL; do not claim to erase browser history. No decorative real patient imagery. Ensure 360px mobile, 768px tablet and 1440px desktop layouts. Use empty/loading/failure/retry states. No dead buttons or placeholders presented as implemented.

### Implement the core experience

1. **Landing + demo scenario picker** (`/`, `/demo`): polished hero, short problem and value proposition, start fictional case, six presets D01–D05 plus D10, navigation to evidence and test results, locale switch, always clear synthetic banner. Launch creates an isolated anonymous authenticated session only after explicit fictional consent and adult scenario acknowledgement. No real personal information. If consent denied, show education/safety notice only and no stored assessment.
2. **SignalSense** (`/assessment`): safety flags first, backend and client urgent gate, then short structured intake. Use `yes/no/unknown/prefer_not` for flags and exact enums from PRD. Age band no age-only routing. All optional fields truly skippable. Persist securely with expectedRevision; edits invalidate prior result and stale shares. Review before evaluation. Can work without a report.
3. **EvidenceLens** (assessment report step): only fixed synthetic report fixture IDs, render text/HTML preview clearly marked synthetic. Gemini structured JSON extracts explicit values/units/lab flags + exact excerpts. Validate with Zod and compare against trusted fixture lines/field mapping; reject mismatched data; require user confirmation using candidate IDs; only confirmed grounded lab-explicit abnormal flag may influence nonurgent rule. Model provider output never controls route. Keep extraction mode prominent. Include replay path for provider outage, and continue without AI. Do not invent PDF scanning: expose text extraction honestly unless P1 PDF actually implemented and tested.
4. **CarePath** (`/assessment/result`): server computes pathway from versioned PRD rules, static bilingual explanatory copy, relevant source IDs and actual intake evidence, uncertainty/unknowns. No numeric risk score. Modes urgent, clarify_safety, urology_andrology, fertility_services, primary_care, needs_clarification, education. Show education/clinical limitations and proposed next steps. Urgent result has immediate local emergency evaluation message and no routine flow CTA. No real clinician directory or booking.
5. **PrivacyVault** (`/care`, `/privacy`): explicit selected-field preview (none checked by default), create immutable snapshot on server, expire in <=24h, list current share, revoke with immediate denial, printable selected summary only, reset/delete with confirmation and signout. No actual external transfer. Show consent status, data retention and external model processing notice.
6. **CareLoop** (`/review`, `/care`): owner-only simulated coordinator panel, showing only active snapshot and selected fields, not raw records. Simulated transitions shared → acknowledged → simulated_scheduled → simulated_completed; validated and idempotent with events. No actual booking, appointment, referral completion, physician approval or messaging claims. Owner sees timeline. Show revoked/stale/expired empty/error state.
7. **CultureBridge and judge evidence** (`/evidence`, `/evaluation`): complete English/Arabic P0 labels (mark draft translation until reviewed), source links and source/version registry, actual generated evaluation JSON with counts, denominators, rule version, mode, elapsed times, failures, and limitations. No hardcoded scoreboards. Judge can reset/relaunch case. A report-free path, urgent path, report and share path all work.

### Supabase implementation (mandatory P0)

Use a dedicated demo project (never assume access to an existing DB). Set up SSR browser/server clients with verified Auth user server-side, anonymous Auth enabled by operator and scoped cookies. Use the official current Supabase SSR guide. Use migrations, not one-off hidden manual changes. Generate typed DB schema/types after migration if possible. Create demo_sessions, consents, assessments, report_extractions, screening_results, care_shares, care_events, audit_events with exact columns/constraints from PRD section 9. All session data scoped to auth.uid, parent ownership tuple FKs, immutable owner/revision controls, expiry checks, indexes. Deny anon/public reads. Use RLS for authenticated owner reads. Constrain grants on all direct writes, including snapshots, derived results, confirmations, consents and event transitions. Test direct REST as authenticated session B, not just frontend guards.

**Critical trusted-write decision:** use the user-scoped Supabase client for owner reads and verifying identity/consent; for derived writes use a server-only client with `SUPABASE_SERVICE_ROLE_KEY` calling narrow transactional RPCs executable by service_role only. Revoke execute from PUBLIC, anon and authenticated and revoke direct writes to derived tables so a client cannot call a procedure directly with forged results. The server verifies identity with the normal user auth client, never trusts owner supplied in payload, computes all derived data, and passes verified owner, revision and validated result to scoped RPC. Inside transaction check owner-parent relationships, revision, expiry, current consent, valid transition and affected row count; prevent race between revocation and status update. The service role bypasses RLS: do not build general-purpose service-role queries or expose it in browser bundles. Use normal RLS reads. Prefer invoker procedures, explicit schema qualifications and fixed search path for any definer function. Add SQL/integration negative tests for cross-owner and forged derived values. If using an alternative secure architecture, explain and test equivalent constraints rather than weakening them. No `auth.uid()` assumption in service-role RPC; explicit verified owner only from server. Do not expose a public SQL execution endpoint.

For public P0 there is no arbitrary file storage. If provisioning storage, keep private and deny all unnecessary access; no upload UI. Fixture texts are checked into repo, synthetic and allowed. Anonymous session expires <=24h; implement read/write checks and documented purge job/operator SQL; do not claim physical auto-deletion unless actual scheduled job verified. Delete transaction and sign out; test it. Do not run destructive SQL against remote without operator review/permission. Apply migrations locally first or to dedicated demo project with explicit approval. No hardcoded connection string or credentials.

### Required server APIs

Implement section 10 contracts and response errors for `POST /api/demo/start`, `PATCH /api/assessment`, `POST /api/assessment/evaluate`, `POST /api/consent`, `POST /api/report/extract`, `POST /api/report/confirm`, `POST /api/share`, `GET /api/share/current`, `POST /api/share/revoke`, `POST /api/care/event`, `DELETE /api/demo/session`, `GET /api/evaluation`. Equivalent server actions allowed only if same tests and authorization. Use strict input schemas, no owner/role in payload, verified user/session, expected revision, no-store, origin/CSRF checks, bounded body and backend limits. Standard error contract with safe message key/request ID; do not leak technical or medical data. Apply DB-backed rate cap on extraction; server-only Gemini call, timeout around 12s, limited attempts, structured schema, exact evidence validation. Never redirect health state in URL. No long background jobs. Ensure Vercel runtime fits configured plan.

### Environment and deployment

Create `.env.example` containing blank placeholders:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
APP_ENV=demo
AI_MODE=live
DEMO_ONLY=true
APP_ORIGIN=http://localhost:3000
```

Use the publishable key in client only; service role and model key server-only. Require `DEMO_ONLY=true`, fail closed otherwise. No key in chat, docs, logs, generated output, terminal echo or Git. Instruct operator to enter credentials directly in `.env.local` and Vercel dashboard. `.gitignore` includes env files except template, local auth state, node_modules and build output. If `GEMINI_API_KEY` absent, support explicit replay mode, not silent fake live results. If Supabase missing, local-only demo mode can be implemented explicitly for pure workflow/testing but production deployment must either have real configured DB or be visibly marked degraded, never misrepresent persisted state. No external services or charges without human permission. Separate preview/prod credentials and Supabase projects if available.

Write README with exact setup, Supabase anonymous auth setting, migration CLI/SQL Editor instructions, origin/redirect configuration, env setup, seed and launch commands, fallback, limitations and test instructions. Write GitHub Actions workflow with stable Node, `npm ci`, lint, typecheck, unit tests and production build. Integration/E2E tests run in safe separate test env with controlled credentials, not production data or untrusted PR secrets. Add `npm run evaluate` generated aggregate report. Verify current project type and scripts (do not rely on obsolete `next lint`). Use `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run evaluate`, `npm run build`, `npm run test:e2e`; output actual results and failures. If E2E setup missing, install browser and run local tests or document exact blocker. Do not claim pass without output.

Prepare Git repository, check diff and secret scan, show operator proposed commands to push to their GitHub repository. Do not push, publish, create remote resources, modify existing production DB, install paid integrations, or deploy to public without operator explicit permission. When authorized, use the provided repo URL, verify remote, commit and push; then guide Vercel import using Next.js defaults and secure env variables. When authorized and CLI/account available deploy and verify live link in browser. Validate app origin, callback, auth persistence, mobile, urgent, live/replay mode, share/revoke/delete and separate-browser isolation. Never report deployment success based only on a command invocation. If remote tooling unavailable, provide exact steps and keep project deploy-ready. Check actual organiser portal IP/repository visibility requirement before public GitHub; prefer private initially. No actual patient health information on GitHub or Vercel.

### Milestones — follow in order and do the work

| Gate | Tasks | Required verification |
|---|---|---|
| G0 | Inspect workspace, scaffold Next.js, PRD docs, branding, schema/fixture registry, scripts/env | Build scaffold and landing, git diff safe |
| G1 | Implement pure safety and rule engine with types and citations, independent expected cases, static safety copy | Unit tests D01/D03/D04/D05/D10/D11/D14/D18 incl. conflict precedence |
| G2 | Add SSR Auth, SQL migrations, RLS and restricted RPC, consent/session/revision/delete APIs | Inspect migration grants; local/dedicated Supabase test with two users, RLS negative tests; if blocked record not verified |
| G3 | Full mobile intake, locale, evidence and result screens, urgent and no-report flow | E2E D01/D03/D04/D05/D10, keyboard/RTL sanity |
| G4 | AI adapter, fixture allowlist, schema verifier, confirmation/replay and timeout | D02/D06/D12/D17 unit/e2e, real Gemini synthetic extraction if key provided |
| G5 | Share projection and simulated coordinator timeline, revoke/expiry/stale/delete | D07/D08/D09/D15/D16, direct client API tests |
| G6 | Evaluation report, docs, README, CI, lint/typecheck/test/build, smoke, demo preparation | Actual report with counts; docs no overclaims; verified deploy if approved |

You may parallelise independent local implementation when safe, but use gated merges; avoid scope creep. The highest priority is safe end-to-end functionality, not feature quantity. If cutoff near, leave P1 and P2 untouched, prioritise a real demo, test results and submission docs. Do not leave unsafe or incomplete features exposed: remove/disable and disclose their absence. Record exact blockers, no invented outputs. Do not implement a generic chatbot.

### Required evaluation artifacts and verification

Seed D01–D18 exactly as described in PRD section 12; provide six preset cases plus parameterised safety, unknowns, fairness consistency and priority tests. Build expected results independent of implementation. Use synthetic fixtures with author-written text and no personal identifiers. `npm run evaluate` creates `docs/evaluation-results.json` from actual runs. Include sample counts, passed/failed, route concordance, emergency override coverage, exact-evidence grounding, extraction precision/recall where labelled, language/age-band pairs, time if observed, model/mode, actual failures, commit/version/timestamp. For metrics not observed use null and reason, not zero or 100%. Clinical validation status always “not validated”. Separate real AI tests from replay. Exit nonzero on P0 safety test failures; evaluation page should visibly show report timestamp and test status, not fabricated charts. Use browser automation where supported to inspect desktop/mobile screens and key flows. Check no console errors, sensitive logs, exposed key, dev placeholders, broken links; run axe or basic keyboard/contrast checks and record limits.

Author these files as part of repository, with actual tested implementation details:

- `README.md`, `.env.example`, `docs/ARCHITECTURE.md` (Mermaid), `docs/ASSUMPTIONS_LIMITATIONS.md`.
- `docs/CLINICAL_SAFETY.md` (versioned rule rationale, C1–C5 sources, approval pending, emergency behavior, failure modes).
- `docs/DATA_SOURCES.md` (synthetic fixture provenance, model details, licence/attribution), `docs/SECURITY.md` (auth, RLS, RPC restrictions, consent, retention, known risk).
- `docs/EVALUATION.md` and generated JSON, actual test logs summary and unverified cases.
- `docs/DEMO_SCRIPT.md` (3 minutes, scenario D01 then D02, emergency D04, share/revoke, actual metrics; adapt if portal format different).
- `docs/PILOT_PLAN.md` (B2B providers, validation, approved data handling, future FHIR, no claimed customers).
- `docs/SUBMISSION_CHECKLIST.md` (six challenge requirements + judging criteria traceability; organiser rulebook unavailable, portal checklist, IP/AI disclosure, submission format). `docs/BUILD_LOG.md` (decision history, completed/blocked milestones).

Use URLs and short paraphrases in PRD references; do not copy full copyrighted guidelines or use sponsor logos as endorsements. Document actual third-party dependencies and selected model. Never imply an externally reviewed/clinically licensed score, actual referral, or regulatory approval.

### Final agent handoff

When the implementation work is complete or genuinely blocked, respond with a concise, verifiable handoff:

1. What is implemented vs simulated vs incomplete; exact P0 gate status.
2. Local run command, path, verified working demo URL only if deployed and browser-smoke-tested; commit hash if exists.
3. Environment variables still required (names only, never values), precise Supabase setup/migration steps and Vercel/GitHub publishing steps that need operator approval.
4. Actual command results for lint/typecheck/test/evaluate/build/e2e and security/clinical safety tests; report file paths and known failures. No unsupported statements.
5. Traceability against the six official requirements and six judging criteria, gaps and highest priority fixes; do not claim full competition compliance (full terms unavailable).
6. Fastest path to submit: working URL, source repo, technical docs, assumptions/limits and optional deck/video using exact portal instructions. Do not submit autonomously unless explicitly authorised and permitted.

Start now. Inspect the workspace, read the PRD, create the plan/checklist and implement G0/G1. Continue through the remaining gates as far as verified environment and permissions allow.

## END — stop copying here

---

## Follow-up prompts (use only as needed after master prompt)

**If the agent stops at planning:**

> Implement the plan now. Work in the current repo, starting with the pure routing engine and tests, then the Supabase schema and UI as ordered in the PRD. Run the tests and production build. Do not stop after describing what you would implement. Keep clinical safety and synthetic-only boundaries. Report tested outcomes and blockers, not plans.

**When credentials are ready (enter locally, do not paste keys into chat):**

> I have configured the dedicated demo Supabase project, enabled anonymous auth, and entered the required env values locally. Verify env presence without printing values. Review migrations and RPC privileges with me before remote application. Test auth, RLS isolation with two independent sessions, direct REST negative access, expiry/revoke/delete, and live Gemini extraction on a synthetic fixture. Generate actual evaluation JSON. If a remote operation needs approval, show exact target and safe command first.

**Judge/QA audit pass:**

> Act as a skeptical hackathon judge and healthcare security QA engineer. Audit the entire implemented PRD P0 traceability. Open the product in a browser and test six core scenarios, mobile/desktop, Arabic RTL, urgent override, unknown safety, AI decline and failure, report verification, selected-field sharing/revoke, stale revision and two-browser access isolation. Test direct authenticated client attempts to forge derived values. Run lint/typecheck/unit/evaluation/build/E2E. Fix issues in dependency order, only within scope, and regenerate the actual report. Mark any claim not proved as unverified. Ensure no real health input or PHI upload, no invented KPIs, no secrets, no regulatory claim. Return P0 pass/fail table and submission blockers.

**Deployment handoff (after QA):**

> Prepare the verified build for GitHub and Vercel. Inspect git status, staged diff, `.gitignore`, secret scanning and all docs. Do not create public repo or push until I approve the exact remote and visibility. Show the required env variable names, safe Supabase migration procedure and Vercel project settings. Once I explicitly approve, push/deploy only to the specified project. Verify the HTTPS URL in incognito with two independent sessions, safety paths and model mode. Document exact commit, URL and actual smoke results. If unable to deploy, provide exact remaining manual steps, not a pretend URL.

**Emergency scope reduction if deadline approaches:**

> Focus on a runnable synthetic-only submission, not extra functionality. Prioritise urgent safety/unknown gate, scenario intake, source-linked deterministic result, honest extraction mode, consent-controlled share/revoke simulation, actual test report and deployment docs. Disable incomplete features visibly; document unmet requirements. No P1/P2, no real patient input, no invented claims. Produce a working demo and accurate submission materials from what is verified.
