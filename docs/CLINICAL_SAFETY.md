# VitaSignal AI — Clinical Safety & Decision Logic

## 1. Safety Principles

1. **Never Infer Fertility:** VitaSignal AI does not calculate fertility scores, disease probabilities, or give false reassurance.
2. **Deterministic Routing:** LLMs never triage patients or select care pathways. All pathways are computed by pure, auditable TypeScript functions.
3. **Emergency Precedence:** Sudden severe testicular pain or pain with nausea immediately halts routine intake and displays emergency care guidance.
4. **Preserve Missingness:** Skipped or unknown answers are never treated as negative clinical findings.

---

## 2. Decision Rules Inventory

| Priority | Rule ID | Category | Primary Condition | Proposed Pathway | Source |
|---|---|---|---|---|---|
| **P1** | `SAFE-01` | Urgent Safety | Sudden severe pain OR pain with nausea | `urgent` | NHS [C4] |
| **P2** | `SAFE-02` | Safety Clarification | Safety questions unanswered / unknown | `clarify_safety` | NHS [C4] |
| **P3** | `SPEC-01` | Specialist Evaluation | Lump/swelling, surgery, cryptorchidism, or confirmed lab abnormality | `urology_andrology` | AUA/ASRM [C2], EAU [C3], NHS [C5] |
| **P4** | `FERT-01` | Fertility Evaluation | Difficulty conceiving or reproductive goal | `fertility_services` | WHO [C1], AUA/ASRM [C2] |
| **P5** | `PCP-01` | Primary Care | Tobacco, heat exposure, metabolic condition, or infection | `primary_care` | WHO [C1], AUA/ASRM [C2], EAU [C3] |
| **P6** | `DATA-01` | Data Clarification | Key non-urgent questions skipped | `needs_clarification` | WHO [C1] |
| **P7** | `EDU-01` | Routine Education | All negative completed assessment | `education` | WHO [C1], AUA/ASRM [C2], EAU [C3] |

---

## 3. Evidence Sources (C1–C5)

- **[C1] WHO (2025):** Guideline for prevention, diagnosis and treatment of infertility.
- **[C2] AUA/ASRM (2020/2024):** Diagnosis and Treatment of Infertility in Men Guideline.
- **[C3] EAU (2024):** Guidelines on Sexual and Reproductive Health: Male Infertility.
- **[C4] NHS (2024):** Testicle Pain & Urgent Triage Guidelines.
- **[C5] NHS (2024):** Testicle Lumps and Swellings Clinical Guidelines.

*Approval Status: Pending formal clinical advisory board review.*
