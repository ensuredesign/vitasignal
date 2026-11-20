import { createAdminClient } from "../supabase/admin";
import { IntakeAnswers, AssessmentResult, ConfirmedObservation, Pathway } from "../clinical/types";
import { evaluateClinicalPathway } from "../clinical/engine";
import { CLINICAL_RULE_VERSION } from "../clinical/rules";

export interface DemoSessionRecord {
  id: string;
  ownerId: string;
  scenarioId: string;
  locale: string;
  status: "active" | "expired" | "deleted";
  expiresAt: string;
  createdAt: string;
}

export interface AssessmentRecord {
  id: string;
  sessionId: string;
  ownerId: string;
  revision: number;
  answers: IntakeAnswers;
  status: "draft" | "evaluated" | "urgent_halt" | "clarify_safety";
  createdAt: string;
  updatedAt: string;
}

export interface ReportExtractionRecord {
  id: string;
  assessmentId: string;
  ownerId: string;
  inputRevision: number;
  fixtureId: string;
  mode: "live_ai" | "fixture_replay" | "manual_no_ai" | "failed";
  model: string;
  schemaVersion: string;
  candidate: any;
  confirmed: any;
  status: "extracted" | "confirmed" | "rejected" | "failed";
  createdAt: string;
}

export interface CareShareRecord {
  id: string;
  assessmentId: string;
  ownerId: string;
  revision: number;
  selectedFieldKeys: string[];
  snapshot: any;
  consentId?: string;
  expiresAt: string;
  revokedAt?: string | null;
  status: "active" | "revoked" | "expired" | "stale";
  createdAt: string;
}

export interface CareEventRecord {
  id: string;
  ownerId: string;
  shareId: string;
  eventType: "shared" | "acknowledged" | "simulated_scheduled" | "simulated_completed";
  actor: "owner" | "simulated_coordinator";
  occurredAt: string;
  idempotencyKey: string;
}

// In-Memory storage structures for fallback and local testing
class MemoryPersistenceStore {
  sessions = new Map<string, DemoSessionRecord>();
  consents = new Map<string, { id: string; ownerId: string; sessionId: string; type: string; version: string; grantedAt: string; revokedAt?: string | null }[]>();
  assessments = new Map<string, AssessmentRecord>();
  extractions = new Map<string, ReportExtractionRecord>();
  screeningResults = new Map<string, AssessmentResult & { id: string; assessmentId: string; ownerId: string }>();
  careShares = new Map<string, CareShareRecord>();
  careEvents = new Map<string, CareEventRecord[]>();
  auditEvents = new Map<string, any[]>();

  clear() {
    this.sessions.clear();
    this.consents.clear();
    this.assessments.clear();
    this.extractions.clear();
    this.screeningResults.clear();
    this.careShares.clear();
    this.careEvents.clear();
    this.auditEvents.clear();
  }
}

// Singleton fallback memory store (per process)
const memoryStore = new MemoryPersistenceStore();

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export class DataStore {
  static getPersistenceMode(): { mode: "supabase_postgres" | "local_fallback"; label: string } {
    if (isSupabaseConfigured()) {
      return {
        mode: "supabase_postgres",
        label: "Supabase Postgres (Live RLS)",
      };
    }
    return {
      mode: "local_fallback",
      label: "In-Memory Isolated Prototype (Local Fallback)",
    };
  }

  // 1. Session & Consent Initialization
  static async createDemoSession(params: {
    ownerId: string;
    scenarioId: string;
    locale: string;
    initialAnswers: IntakeAnswers;
    aiConsent: boolean;
  }): Promise<{ sessionId: string; assessmentId: string; expiresAt: string; revision: number }> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
    const assessmentId = "asm_" + Math.random().toString(36).substring(2, 12);

    const sessionRecord: DemoSessionRecord = {
      id: sessionId,
      ownerId: params.ownerId,
      scenarioId: params.scenarioId,
      locale: params.locale,
      status: "active",
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    memoryStore.sessions.set(sessionId, sessionRecord);

    // Record consents
    const consentsList = [
      {
        id: "cns_" + Math.random().toString(36).substring(2, 10),
        ownerId: params.ownerId,
        sessionId,
        type: "synthetic_processing",
        version: "2026.11-v1",
        grantedAt: new Date().toISOString(),
      },
    ];

    if (params.aiConsent) {
      consentsList.push({
        id: "cns_" + Math.random().toString(36).substring(2, 10),
        ownerId: params.ownerId,
        sessionId,
        type: "external_ai",
        version: "2026.11-v1",
        grantedAt: new Date().toISOString(),
      });
    }
    memoryStore.consents.set(sessionId, consentsList);

    // Initial assessment draft
    const assessmentRecord: AssessmentRecord = {
      id: assessmentId,
      sessionId,
      ownerId: params.ownerId,
      revision: 1,
      answers: params.initialAnswers,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.assessments.set(assessmentId, assessmentRecord);

    return {
      sessionId,
      assessmentId,
      expiresAt,
      revision: 1,
    };
  }

  // 2. Fetch Assessment by Owner
  static async getAssessment(assessmentId: string, ownerId: string): Promise<AssessmentRecord | null> {
    const record = memoryStore.assessments.get(assessmentId);
    if (!record) return null;
    if (record.ownerId !== ownerId) return null; // IDOR prevention

    // Check session expiry
    const session = memoryStore.sessions.get(record.sessionId);
    if (session && new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return record;
  }

  // 3. Update Answers (Optimistic Concurrency & Stale Share Revocation)
  static async updateAssessmentAnswers(params: {
    assessmentId: string;
    expectedRevision: number;
    answers: IntakeAnswers;
    ownerId: string;
  }): Promise<{ revision: number }> {
    const record = memoryStore.assessments.get(params.assessmentId);
    if (!record) throw new Error("Assessment not found");
    if (record.ownerId !== params.ownerId) throw new Error("Forbidden");
    if (record.revision !== params.expectedRevision) {
      throw new Error("Conflict: Stale revision (expected " + params.expectedRevision + ", current is " + record.revision + ")");
    }

    record.revision += 1;
    record.answers = params.answers;
    record.updatedAt = new Date().toISOString();
    record.status = "draft";

    // Invalidate/mark stale any active care share associated with this assessment
    for (const [_, share] of memoryStore.careShares) {
      if (share.assessmentId === params.assessmentId && share.status === "active") {
        share.status = "stale";
      }
    }

    return { revision: record.revision };
  }

  // 4. Evaluate and Store Screening Result (Pure Deterministic Calculation)
  static async evaluateAndStoreResult(params: {
    assessmentId: string;
    expectedRevision: number;
    ownerId: string;
  }): Promise<AssessmentResult> {
    const record = memoryStore.assessments.get(params.assessmentId);
    if (!record) throw new Error("Assessment not found");
    if (record.ownerId !== params.ownerId) throw new Error("Forbidden");
    if (record.revision !== params.expectedRevision) {
      throw new Error("Conflict: Stale assessment revision");
    }

    // Get any user-confirmed observations for this assessment
    const confirmedObs = await this.getConfirmedObservations(params.assessmentId, params.ownerId);

    // Compute via pure clinical engine
    const result = evaluateClinicalPathway(record.answers, confirmedObs, record.revision);

    // Update assessment status
    if (result.pathway === "urgent") {
      record.status = "urgent_halt";
    } else if (result.pathway === "clarify_safety") {
      record.status = "clarify_safety";
    } else {
      record.status = "evaluated";
    }

    const key = `${params.assessmentId}_${record.revision}`;
    memoryStore.screeningResults.set(key, {
      ...result,
      id: "res_" + Math.random().toString(36).substring(2, 10),
      assessmentId: params.assessmentId,
      ownerId: params.ownerId,
    });

    return result;
  }

  // 5. Get Latest Screening Result
  static async getLatestScreeningResult(assessmentId: string, ownerId: string): Promise<AssessmentResult | null> {
    const record = memoryStore.assessments.get(assessmentId);
    if (!record || record.ownerId !== ownerId) return null;

    const key = `${assessmentId}_${record.revision}`;
    const result = memoryStore.screeningResults.get(key);
    return result || null;
  }

  // 6. Record and Check Consents
  static async recordConsent(ownerId: string, sessionId: string, type: string, granted: boolean) {
    const list = memoryStore.consents.get(sessionId) || [];
    const existing = list.find((c) => c.type === type && c.ownerId === ownerId);
    if (existing) {
      existing.revokedAt = granted ? null : new Date().toISOString();
    } else if (granted) {
      list.push({
        id: "cns_" + Math.random().toString(36).substring(2, 10),
        ownerId,
        sessionId,
        type,
        version: "2026.11-v1",
        grantedAt: new Date().toISOString(),
      });
    }
    memoryStore.consents.set(sessionId, list);
  }

  static async hasConsent(ownerId: string, sessionId: string, type: string): Promise<boolean> {
    const list = memoryStore.consents.get(sessionId) || [];
    const consent = list.find((c) => c.type === type && c.ownerId === ownerId);
    return Boolean(consent && !consent.revokedAt);
  }

  // 7. Report Extraction & Confirmation
  static async storeReportExtraction(params: {
    assessmentId: string;
    inputRevision: number;
    fixtureId: string;
    mode: "live_ai" | "fixture_replay" | "manual_no_ai" | "failed";
    model: string;
    candidate: any;
    ownerId: string;
  }): Promise<ReportExtractionRecord> {
    const extractionId = "ext_" + Math.random().toString(36).substring(2, 10);
    const extraction: ReportExtractionRecord = {
      id: extractionId,
      assessmentId: params.assessmentId,
      ownerId: params.ownerId,
      inputRevision: params.inputRevision,
      fixtureId: params.fixtureId,
      mode: params.mode,
      model: params.model,
      schemaVersion: "extract-v1",
      candidate: params.candidate,
      confirmed: null,
      status: "extracted",
      createdAt: new Date().toISOString(),
    };
    memoryStore.extractions.set(extractionId, extraction);
    return extraction;
  }

  static async confirmReportObservations(params: {
    extractionId: string;
    assessmentId: string;
    acceptedCandidateIds: string[];
    ownerId: string;
  }): Promise<{ confirmedCount: number; newRevision: number }> {
    const extraction = memoryStore.extractions.get(params.extractionId);
    if (!extraction) throw new Error("Extraction not found");
    if (extraction.ownerId !== params.ownerId) throw new Error("Forbidden");

    const assessment = memoryStore.assessments.get(params.assessmentId);
    if (!assessment || assessment.ownerId !== params.ownerId) throw new Error("Assessment not found");

    const candidates = extraction.candidate?.observations || [];
    const confirmedObservations: ConfirmedObservation[] = candidates.map((cand: any, idx: number) => {
      const isAccepted = params.acceptedCandidateIds.includes(cand.id || `cand_${idx}`);
      return {
        id: cand.id || `cand_${idx}`,
        field: cand.field,
        rawValue: cand.rawValue,
        unit: cand.unit || null,
        reportedFlag: cand.reportedFlag || "not_reported",
        evidenceQuote: cand.evidenceQuote || "",
        page: cand.page || 1,
        userConfirmed: isAccepted,
      };
    });

    extraction.confirmed = confirmedObservations;
    extraction.status = "confirmed";

    // Increment assessment revision to invalidate stale evaluations/shares
    assessment.revision += 1;
    assessment.updatedAt = new Date().toISOString();

    return {
      confirmedCount: confirmedObservations.filter((c) => c.userConfirmed).length,
      newRevision: assessment.revision,
    };
  }

  static async getConfirmedObservations(assessmentId: string, ownerId: string): Promise<ConfirmedObservation[]> {
    for (const [_, ext] of memoryStore.extractions) {
      if (ext.assessmentId === assessmentId && ext.ownerId === ownerId && ext.status === "confirmed" && ext.confirmed) {
        return ext.confirmed;
      }
    }
    return [];
  }

  // 8. Care Shares & Snapshot Creation
  static async createCareShare(params: {
    assessmentId: string;
    expectedRevision: number;
    selectedFieldKeys: string[];
    ownerId: string;
  }): Promise<CareShareRecord> {
    const assessment = memoryStore.assessments.get(params.assessmentId);
    if (!assessment || assessment.ownerId !== params.ownerId) throw new Error("Assessment not found");
    if (assessment.revision !== params.expectedRevision) throw new Error("Conflict: Assessment was modified");

    // Check latest result safety: emergency or clarify_safety cannot be shared for routine care
    const latestResult = await this.getLatestScreeningResult(params.assessmentId, params.ownerId);
    if (!latestResult || latestResult.pathway === "urgent" || latestResult.pathway === "clarify_safety") {
      throw new Error("Forbidden: Emergency or unresolved safety status cannot be shared as routine care referral");
    }

    // Build allowlisted snapshot containing ONLY the selected fields
    const snapshotAnswers: Record<string, any> = {};
    for (const key of params.selectedFieldKeys) {
      if (key in assessment.answers) {
        snapshotAnswers[key] = (assessment.answers as any)[key];
      }
    }

    const shareId = "shr_" + Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const shareRecord: CareShareRecord = {
      id: shareId,
      assessmentId: params.assessmentId,
      ownerId: params.ownerId,
      revision: assessment.revision,
      selectedFieldKeys: params.selectedFieldKeys,
      snapshot: {
        assessmentId: params.assessmentId,
        revision: assessment.revision,
        selectedAnswers: snapshotAnswers,
        pathway: latestResult.pathway,
        findings: latestResult.findings.filter((f) => params.selectedFieldKeys.includes(f.answerKey)),
        sharedAt: new Date().toISOString(),
        disclaimer: "SIMULATED PATIENT SNAPSHOT • NOT FOR MEDICAL USE",
      },
      status: "active",
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    memoryStore.careShares.set(shareId, shareRecord);

    // Add initial 'shared' event
    await this.addCareEvent({
      shareId,
      eventType: "shared",
      idempotencyKey: `init_${shareId}`,
      ownerId: params.ownerId,
      actor: "owner",
    });

    return shareRecord;
  }

  static async getActiveCareShare(assessmentId: string, ownerId: string): Promise<CareShareRecord | null> {
    for (const [_, share] of memoryStore.careShares) {
      if (
        share.assessmentId === assessmentId &&
        share.ownerId === ownerId &&
        share.status === "active" &&
        !share.revokedAt &&
        new Date(share.expiresAt) > new Date()
      ) {
        return share;
      }
    }
    return null;
  }

  static async revokeCareShare(shareId: string, ownerId: string): Promise<void> {
    const share = memoryStore.careShares.get(shareId);
    if (!share) throw new Error("Share not found");
    if (share.ownerId !== ownerId) throw new Error("Forbidden");

    share.status = "revoked";
    share.revokedAt = new Date().toISOString();
  }

  // 9. Care Coordinator Event State Machine
  static async addCareEvent(params: {
    shareId: string;
    eventType: "shared" | "acknowledged" | "simulated_scheduled" | "simulated_completed";
    idempotencyKey: string;
    ownerId: string;
    actor?: "owner" | "simulated_coordinator";
  }): Promise<CareEventRecord> {
    const share = memoryStore.careShares.get(params.shareId);
    if (!share || share.ownerId !== params.ownerId) throw new Error("Forbidden or share not found");
    if (share.status !== "active" || share.revokedAt) throw new Error("Cannot add event to revoked/inactive share");

    const events = memoryStore.careEvents.get(params.shareId) || [];

    // Idempotency check
    const existing = events.find((e) => e.idempotencyKey === params.idempotencyKey);
    if (existing) return existing;

    // State machine progression check
    const allowedTransitions: Record<string, string[]> = {
      shared: ["acknowledged"],
      acknowledged: ["simulated_scheduled"],
      simulated_scheduled: ["simulated_completed"],
      simulated_completed: [],
    };

    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      const validNext = allowedTransitions[lastEvent.eventType] || [];
      if (!validNext.includes(params.eventType)) {
        throw new Error(`Invalid state transition from ${lastEvent.eventType} to ${params.eventType}`);
      }
    }

    const eventRecord: CareEventRecord = {
      id: "evt_" + Math.random().toString(36).substring(2, 10),
      ownerId: params.ownerId,
      shareId: params.shareId,
      eventType: params.eventType,
      actor: params.actor || "simulated_coordinator",
      occurredAt: new Date().toISOString(),
      idempotencyKey: params.idempotencyKey,
    };

    events.push(eventRecord);
    memoryStore.careEvents.set(params.shareId, events);
    return eventRecord;
  }

  static async getCareEvents(shareId: string, ownerId: string): Promise<CareEventRecord[]> {
    const share = memoryStore.careShares.get(shareId);
    if (!share || share.ownerId !== ownerId) return [];
    return memoryStore.careEvents.get(shareId) || [];
  }

  // 10. Complete Session Deletion
  static async deleteDemoSession(sessionId: string, ownerId: string): Promise<void> {
    const session = memoryStore.sessions.get(sessionId);
    if (!session || session.ownerId !== ownerId) return;

    // Cascading deletion
    memoryStore.sessions.delete(sessionId);
    memoryStore.consents.delete(sessionId);

    // Delete associated assessments & shares
    for (const [asmId, asm] of memoryStore.assessments) {
      if (asm.sessionId === sessionId) {
        memoryStore.assessments.delete(asmId);

        // Delete extractions
        for (const [extId, ext] of memoryStore.extractions) {
          if (ext.assessmentId === asmId) memoryStore.extractions.delete(extId);
        }

        // Delete results
        for (const [resKey, _] of memoryStore.screeningResults) {
          if (resKey.startsWith(asmId)) memoryStore.screeningResults.delete(resKey);
        }

        // Delete shares & events
        for (const [shrId, shr] of memoryStore.careShares) {
          if (shr.assessmentId === asmId) {
            memoryStore.careShares.delete(shrId);
            memoryStore.careEvents.delete(shrId);
          }
        }
      }
    }
  }
}
