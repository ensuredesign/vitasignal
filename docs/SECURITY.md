# VitaSignal AI — Security, RLS & Access Control

## 1. Security Architecture

- **Defense in Depth:** Row Level Security (RLS) is enabled on all Supabase tables.
- **Ownership Verification:** All rows carry an `owner_id` validated against `auth.uid()`.
- **Restricted Procedural Writes:** Derived states (screening results, share snapshots, state machine events) are written through transactional RPCs restricted to `service_role`. Direct client mutations are revoked.
- **Ephemeral Sessions:** Anonymous demo sessions automatically expire 24 hours after creation.
- **Immediate Revocation:** Once a care share is revoked by the owner, all further reads and state transitions are rejected with 404/403.

---

## 2. Threat Modeling & Mitigations

| Threat | Vulnerability Risk | VitaSignal AI Mitigation |
|---|---|---|
| **BOLA / IDOR** | User B attempts to view or update User A's case | RLS policies restrict SELECT/UPDATE to `(select auth.uid()) = owner_id`. Verified in `tests/integration/api-contracts.test.ts`. |
| **Prompt Injection** | Malicious instructions in lab text | LLM operates in isolated JSON structured extraction. Verbatim substring validation discards ungrounded observations. LLM cannot route. |
| **Forged Clinical Pathways** | Tampered client payloads sending fake results | Result is recomputed server-side from stored answers. Direct table writes are revoked from client tokens. |
| **Stale Revision Conflict** | Outdated assessment answers sharing old findings | Optimistic concurrency (`expectedRevision`) returns 409 Conflict. Modifying intake invalidates prior shares. |
| **Emergency Delay** | Patient with torsion waits for referral | Hard emergency gate intercepts acute symptoms and displays local emergency instructions immediately. |
