# VitaSignal AI — Automated Evaluation & Test Benchmark

## Execution Evidence

- **Date:** 20 November 2026
- **Test Command:** `npm run evaluate` (also `npm run test`)
- **Generated Report File:** `docs/evaluation-results.json`

---

## Summary Metrics

| Metric | Measured Value | Standard / Interpretation |
|---|---|---|
| **Rule Concordance** | **100%** (9 / 9 scenarios) | Exact match with PRD clinical decision specifications |
| **Urgent Gate Coverage** | **100%** (D04 hard gate) | Acute symptoms immediately halted from routine care |
| **Evidence Grounding** | **100%** (12 / 12 quotes) | Verbatim substring verified in trusted synthetic fixture |
| **Unit & Integration Suite** | **19 / 19 Passed** | 13 Clinical rules + 6 API & security isolation tests |
| **Clinical Validation Status** | **Not Validated** | Research prototype for competition evaluation |

---

## Verification Commands

```bash
# Execute unit and security tests
npx vitest run

# Execute automated evaluation runner
npx tsx scripts/evaluate.ts
```
