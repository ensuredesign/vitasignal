# VitaSignal AI — Technical Architecture

## System Architecture

```mermaid
flowchart TD
  subgraph Client ["Client Browser (Desktop & Mobile)"]
    A["Judge / Participant Browser"] --> B["Bilingual UI (Next.js 15)"]
    B --> C["LocaleProvider (EN / AR RTL)"]
    B --> D["SignalSense Intake Wizard"]
    B --> E["PrivacyVault Sharing UI"]
    B --> F["CareLoop Simulated Coordinator"]
  end

  subgraph Server ["Next.js Server Layer (Vercel / Node Runtime)"]
    G["Server Route Handlers (/api/*)"]
    H["Auth Context & Session Validation"]
    I["Deterministic Clinical Engine (engine.ts)"]
    J["EvidenceLens AI Adapter (provider.ts)"]
    K["Evidence Verifier (verify.ts)"]
  end

  subgraph External ["External Services & Storage"]
    L["Google Gemini API (gemini-3.8-flash)"]
    M["Replay Fixtures (reports.ts)"]
    N[("Supabase Postgres + RLS")]
    O["Memory Demo Repository (Fallback)"]
  end

  A --> B
  D --> G
  E --> G
  F --> G
  G --> H
  H --> I
  G --> J
  J -->|Live AI Mode| L
  J -->|Replay Mode| M
  L --> K
  K --> G
  G --> N
  G -.->|If No DB Configured| O
```

## Security & Trust Boundaries

1. **Untrusted Client:** All user inputs pass through strict Zod schemas on the server. Client-side state transitions or role assignments are never trusted.
2. **Safety Override Gate:** Priority 1 and 2 rules are independently calculated by the backend before any AI calls or care sharing.
3. **Data Minimization:** No PII is collected. Sessions expire within 24 hours.
4. **Verbatim Grounding:** Evidence quotes from synthetic lab reports must match allowlisted fixture text verbatim before user confirmation.
