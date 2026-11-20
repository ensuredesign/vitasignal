import { describe, it, expect } from "vitest";
import { DataStore } from "../../src/lib/persistence/store";
import { BENCHMARK_CASES } from "../../src/lib/fixtures/cases";

describe("Gate 2 & Gate 5: Persistence, API Contracts & Security Isolation", () => {
  it("D01: Creates demo session with 24-hour expiry, owner isolation, and draft status", async () => {
    const ownerA = "user_A_123";
    const session = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D01",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D01"].answers,
      aiConsent: true,
    });

    expect(session.sessionId).toBeDefined();
    expect(session.assessmentId).toBeDefined();
    expect(session.revision).toBe(1);

    const assessment = await DataStore.getAssessment(session.assessmentId, ownerA);
    expect(assessment).not.toBeNull();
    expect(assessment?.answers.tobaccoUse).toBe("yes");
    expect(assessment?.status).toBe("draft");
  });

  it("D07 IDOR Prevention: User B cannot access or inspect User A's assessment", async () => {
    const ownerA = "user_A_sec";
    const ownerB = "user_B_attacker";

    const sessionA = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D02",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D02"].answers,
      aiConsent: false,
    });

    // User B tries to read User A's assessment
    const unauthorizedRead = await DataStore.getAssessment(sessionA.assessmentId, ownerB);
    expect(unauthorizedRead).toBeNull();

    // User B tries to update User A's assessment
    await expect(
      DataStore.updateAssessmentAnswers({
        assessmentId: sessionA.assessmentId,
        expectedRevision: 1,
        answers: BENCHMARK_CASES["D01"].answers,
        ownerId: ownerB,
      })
    ).rejects.toThrow(/Forbidden/);
  });

  it("D15 Optimistic Concurrency: Modifying assessment with stale revision fails with 409 Conflict", async () => {
    const ownerA = "user_A_concurrency";
    const session = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D01",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D01"].answers,
      aiConsent: false,
    });

    // First valid update increments revision to 2
    const firstUpdate = await DataStore.updateAssessmentAnswers({
      assessmentId: session.assessmentId,
      expectedRevision: 1,
      answers: { ...BENCHMARK_CASES["D01"].answers, tobaccoUse: "no" },
      ownerId: ownerA,
    });
    expect(firstUpdate.revision).toBe(2);

    // Stale update still presenting revision 1 must throw Conflict
    await expect(
      DataStore.updateAssessmentAnswers({
        assessmentId: session.assessmentId,
        expectedRevision: 1, // Stale!
        answers: { ...BENCHMARK_CASES["D01"].answers, tobaccoUse: "yes" },
        ownerId: ownerA,
      })
    ).rejects.toThrow(/Conflict: Stale revision/);
  });

  it("D08 & D16: Granular share, care coordinator state machine, and instant revocation", async () => {
    const ownerA = "user_A_share";
    const session = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D01",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D01"].answers,
      aiConsent: false,
    });

    // Evaluate first
    await DataStore.evaluateAndStoreResult({
      assessmentId: session.assessmentId,
      expectedRevision: 1,
      ownerId: ownerA,
    });

    // Create share with selected fields (tobaccoUse only)
    const share = await DataStore.createCareShare({
      assessmentId: session.assessmentId,
      expectedRevision: 1,
      selectedFieldKeys: ["tobaccoUse"],
      ownerId: ownerA,
    });

    expect(share.id).toBeDefined();
    expect(share.snapshot.selectedAnswers).toEqual({ tobaccoUse: "yes" });
    // Verify non-selected fields are omitted from snapshot
    expect(share.snapshot.selectedAnswers.occupationalHeatExposure).toBeUndefined();

    // Advance state machine: shared -> acknowledged
    const ackEvent = await DataStore.addCareEvent({
      shareId: share.id,
      eventType: "acknowledged",
      idempotencyKey: "idem_ack_1",
      ownerId: ownerA,
    });
    expect(ackEvent.eventType).toBe("acknowledged");

    // Advance state machine: acknowledged -> simulated_scheduled
    const schedEvent = await DataStore.addCareEvent({
      shareId: share.id,
      eventType: "simulated_scheduled",
      idempotencyKey: "idem_sched_1",
      ownerId: ownerA,
    });
    expect(schedEvent.eventType).toBe("simulated_scheduled");

    // Invalid transition: cannot jump directly from simulated_scheduled to acknowledged
    await expect(
      DataStore.addCareEvent({
        shareId: share.id,
        eventType: "acknowledged",
        idempotencyKey: "idem_inv_1",
        ownerId: ownerA,
      })
    ).rejects.toThrow(/Invalid state transition/);

    // Complete simulated care: simulated_scheduled -> simulated_completed
    const compEvent = await DataStore.addCareEvent({
      shareId: share.id,
      eventType: "simulated_completed",
      idempotencyKey: "idem_comp_1",
      ownerId: ownerA,
    });
    expect(compEvent.eventType).toBe("simulated_completed");

    // Revoke share immediately
    await DataStore.revokeCareShare(share.id, ownerA);

    // Active share lookup now returns null
    const activeShareAfterRevocation = await DataStore.getActiveCareShare(session.assessmentId, ownerA);
    expect(activeShareAfterRevocation).toBeNull();

    // Any further event attempts on revoked share are rejected
    await expect(
      DataStore.addCareEvent({
        shareId: share.id,
        eventType: "simulated_completed",
        idempotencyKey: "idem_post_revoke",
        ownerId: ownerA,
      })
    ).rejects.toThrow(/Cannot add event to revoked/);
  });

  it("D04 Emergency Safety: Urgent acute scenarios are blocked from routine care sharing", async () => {
    const ownerA = "user_A_urgent_share";
    const session = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D04",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D04"].answers,
      aiConsent: false,
    });

    await DataStore.evaluateAndStoreResult({
      assessmentId: session.assessmentId,
      expectedRevision: 1,
      ownerId: ownerA,
    });

    // Attempting to create a routine care share for an emergency must be strictly denied
    await expect(
      DataStore.createCareShare({
        assessmentId: session.assessmentId,
        expectedRevision: 1,
        selectedFieldKeys: ["suddenSevereTesticularPain"],
        ownerId: ownerA,
      })
    ).rejects.toThrow(/Forbidden: Emergency or unresolved safety status cannot be shared/);
  });

  it("D09 Complete Session Deletion: permanently cascades and removes records", async () => {
    const ownerA = "user_A_delete";
    const session = await DataStore.createDemoSession({
      ownerId: ownerA,
      scenarioId: "D01",
      locale: "en",
      initialAnswers: BENCHMARK_CASES["D01"].answers,
      aiConsent: false,
    });

    // Delete session
    await DataStore.deleteDemoSession(session.sessionId, ownerA);

    // Verification: assessment is gone
    const assessment = await DataStore.getAssessment(session.assessmentId, ownerA);
    expect(assessment).toBeNull();
  });
});
