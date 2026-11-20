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
    let sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
    let assessmentId = "asm_" + Math.random().toString(36).substring(2, 12);

    const client = createAdminClient();
    if (client) {
      try {
        const { data, error } = await client.rpc("rpc_create_demo_session", {
          p_owner_id: params.ownerId,
          p_scenario_id: params.scenarioId,
          p_locale: params.locale,
          p_initial_answers: params.initialAnswers,
          p_ai_consent: params.aiConsent,
        });

        if (!error && data) {
          sessionId = data.sessionId;
          assessmentId = data.assessmentId;
        }
      } catch (err) {
        console.warn("Supabase RPC fallback to memory:", err);
      }
    }

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
    let record = memoryStore.assessments.get(assessmentId);
    if (!record) {
      const client = createAdminClient();
      if (client) {
        try {
          const { data } = await client
            .from("assessments")
            .select("*")
            .eq("id", assessmentId)
            .eq("owner_id", ownerId)
            .maybeSingle();
          if (data) {
            record = {
              id: data.id,
              sessionId: data.session_id,
              ownerId: data.owner_id,
              revision: data.revision,
              answers: data.answers,
              status: data.status,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            memoryStore.assessments.set(data.id, record);
          }
        } catch (err) {
          console.warn("Supabase getAssessment error:", err);
        }
      }
    }
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

    const client = createAdminClient();
    if (client) {
      try {
        await client
          .from("assessments")
          .update({
            revision: record.revision,
            answers: params.answers,
            status: "draft",
            updated_at: record.updatedAt,
          })
          .eq("id", params.assessmentId)
          .eq("owner_id", params.ownerId);

        await client
          .from("care_shares")
          .update({ status: "stale" })
          .eq("assessment_id", params.assessmentId)
          .eq("status", "active");
      } catch (err) {
        console.warn("Supabase updateAssessmentAnswers sync warning:", err);
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
    const record = memoryStore.assessments.get(params.assessmentId) || (await this.getAssessment(params.assessmentId, params.ownerId)) || undefined;
    if (!record) throw new Error("Assessment not found");
    if (record.ownerId !== params.ownerId) throw new Error("Forbidden");
    if (record.revision !== params.expectedRevision) {
      // Tolerate 1-revision difference caused by async PATCH sync immediately before evaluate
      if (Math.abs(record.revision - params.expectedRevision) > 1) {
        throw new Error("Conflict: Stale assessment revision");
      }
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

    const client = createAdminClient();
    if (client) {
      try {
        await client
          .from("assessments")
          .update({
            status: record.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", params.assessmentId)
          .eq("owner_id", params.ownerId);

        await client.from("screening_results").upsert({
          assessment_id: params.assessmentId,
          owner_id: params.ownerId,
          revision: record.revision,
          rule_version: CLINICAL_RULE_VERSION,
          pathway: result.pathway,
          findings: result.findings,
          missing: result.missing,
        });
      } catch (err) {
        console.warn("Supabase evaluateAndStoreResult sync warning:", err);
      }
    }

    return result;
  }

  // 5. Get Latest Screening Result
  static async getLatestScreeningResult(assessmentId: string, ownerId: string): Promise<AssessmentResult | null> {
    const record = await this.getAssessment(assessmentId, ownerId);
    if (!record || record.ownerId !== ownerId) return null;

    const key = `${assessmentId}_${record.revision}`;
    let result = memoryStore.screeningResults.get(key);
    if (!result) {
      const client = createAdminClient();
      if (client) {
        try {
          const { data } = await client
            .from("screening_results")
            .select("*")
            .eq("assessment_id", assessmentId)
            .eq("owner_id", ownerId)
            .order("revision", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (data) {
            result = {
              id: data.id || "res_" + Math.random().toString(36).substring(2, 10),
              assessmentId,
              ownerId,
              pathway: data.pathway,
              findings: data.findings || [],
              missing: data.missing || [],
              revision: data.revision,
              ruleVersion: data.rule_version,
              alternatives: [],
              requiresClinicalReview: true,
              generatedAt: data.created_at || new Date().toISOString(),
            };
            memoryStore.screeningResults.set(key, result);
          }
        } catch (err) {
          console.warn("Supabase getLatestScreeningResult error:", err);
        }
      }
    }
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
    const assessment = memoryStore.assessments.get(params.assessmentId) || (await this.getAssessment(params.assessmentId, params.ownerId)) || undefined;
    if (!assessment || assessment.ownerId !== params.ownerId) throw new Error("Assessment not found");
    if (assessment.revision !== params.expectedRevision) {
      if (Math.abs(assessment.revision - params.expectedRevision) > 1) {
        throw new Error("Conflict: Assessment was modified");
      }
    }

    // Check latest result safety: emergency or clarify_safety cannot be shared for routine care
    let latestResult = await this.getLatestScreeningResult(params.assessmentId, params.ownerId);
    if (!latestResult) {
      latestResult = await this.evaluateAndStoreResult({
        assessmentId: params.assessmentId,
        expectedRevision: assessment.revision,
        ownerId: params.ownerId,
      });
    }

    if (!latestResult || latestResult.pathway === "urgent" || latestResult.pathway === "clarify_safety" || assessment.status === "urgent_halt") {
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

    const client = createAdminClient();
    if (client) {
      try {
        await client.from("care_shares").insert({
          id: shareId,
          assessment_id: params.assessmentId,
          owner_id: params.ownerId,
          revision: assessment.revision,
          selected_field_keys: params.selectedFieldKeys,
          snapshot: shareRecord.snapshot,
          status: "active",
          expires_at: expiresAt,
        });
      } catch (err) {
        console.warn("Supabase createCareShare sync warning:", err);
      }
    }

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

    const client = createAdminClient();
    if (client) {
      try {
        const { data } = await client
          .from("care_shares")
          .select("*")
          .eq("assessment_id", assessmentId)
          .eq("owner_id", ownerId)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const shareRecord: CareShareRecord = {
            id: data.id,
            assessmentId: data.assessment_id,
            ownerId: data.owner_id,
            revision: data.revision,
            selectedFieldKeys: data.selected_field_keys,
            snapshot: data.snapshot,
            status: data.status,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
          };
          memoryStore.careShares.set(shareRecord.id, shareRecord);
          return shareRecord;
        }
      } catch (err) {
        console.warn("Supabase getActiveCareShare warning:", err);
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

    const client = createAdminClient();
    if (client) {
      try {
        await client
          .from("care_shares")
          .update({
            status: "revoked",
            revoked_at: share.revokedAt,
          })
          .eq("id", shareId)
          .eq("owner_id", ownerId);
      } catch (err) {
        console.warn("Supabase revokeCareShare sync warning:", err);
      }
    }
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

    const client = createAdminClient();
    if (client) {
      try {
        await client.from("care_events").insert({
          id: eventRecord.id,
          owner_id: params.ownerId,
          share_id: params.shareId,
          event_type: params.eventType,
          actor: eventRecord.actor,
          idempotency_key: params.idempotencyKey,
        });
      } catch (err) {
        console.warn("Supabase addCareEvent sync warning:", err);
      }
    }

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

    const client = createAdminClient();
    if (client) {
      try {
        await client
          .from("demo_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("owner_id", ownerId);
      } catch (err) {
        console.warn("Supabase deleteDemoSession sync warning:", err);
      }
    }

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
