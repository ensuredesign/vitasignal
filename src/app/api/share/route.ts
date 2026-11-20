import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const ShareSchema = z.object({
  assessmentId: z.string(),
  expectedRevision: z.number(),
  selectedFieldKeys: z.array(z.string()).min(1, "Select at least one field to share"),
  consent: z.literal(true),
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
    const parsed = ShareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Explicit consent and at least one field required" } },
        { status: 400 }
      );
    }

    const { assessmentId, expectedRevision, selectedFieldKeys } = parsed.data;

    if (assessmentId !== session.assessmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Assessment does not belong to session" } },
        { status: 403 }
      );
    }

    // Record explicit sharing consent
    await DataStore.recordConsent(session.ownerId, session.sessionId, "sharing", true);

    // Create immutable snapshot
    const shareRecord = await DataStore.createCareShare({
      assessmentId,
      expectedRevision,
      selectedFieldKeys,
      ownerId: session.ownerId,
    });

    return NextResponse.json({
      success: true,
      shareId: shareRecord.id,
      expiresAt: shareRecord.expiresAt,
      status: shareRecord.status,
      snapshot: shareRecord.snapshot,
    });
  } catch (err: any) {
    if (err.message && err.message.includes("Conflict")) {
      return NextResponse.json({ error: { code: "STALE_REVISION", message: err.message } }, { status: 409 });
    }
    if (err.message && err.message.includes("Forbidden")) {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: err.message } }, { status: 403 });
    }
    return NextResponse.json(
      { error: { code: "SHARE_CREATION_FAILED", message: err.message || "Failed to create share" } },
      { status: 500 }
    );
  }
}
