import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { extractReportObservations } from "@/lib/ai/provider";
import { getSessionContext } from "@/lib/auth/session";

const ExtractSchema = z.object({
  assessmentId: z.string(),
  expectedRevision: z.number(),
  fixtureId: z.string(),
  mode: z.enum(["live_ai", "fixture_replay"]).optional().default("live_ai"),
});

export async function POST(req: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Active session required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ExtractSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid extraction parameters" } },
        { status: 400 }
      );
    }

    const { assessmentId, expectedRevision, fixtureId, mode } = parsed.data;

    if (assessmentId !== session.assessmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Assessment does not belong to session" } },
        { status: 403 }
      );
    }

    // Check if external AI consent was granted if live_ai requested
    const hasAiConsent = await DataStore.hasConsent(session.ownerId, session.sessionId, "external_ai");
    const activeMode = hasAiConsent && mode === "live_ai" ? "live_ai" : "fixture_replay";

    // Perform structured extraction with exact evidence verification
    const extractionResult = await extractReportObservations(fixtureId, activeMode);

    // Store extraction candidate record
    const stored = await DataStore.storeReportExtraction({
      assessmentId,
      inputRevision: expectedRevision,
      fixtureId,
      mode: extractionResult.mode,
      model: extractionResult.model,
      candidate: {
        observations: extractionResult.observations,
        unreadable: extractionResult.unreadable,
      },
      ownerId: session.ownerId,
    });

    return NextResponse.json({
      success: true,
      extractionId: stored.id,
      mode: extractionResult.mode,
      model: extractionResult.model,
      observations: extractionResult.observations,
      unreadable: extractionResult.unreadable,
      latencyMs: extractionResult.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "EXTRACTION_FAILED", message: err.message || "Extraction failed" } },
      { status: 500 }
    );
  }
}
