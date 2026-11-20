import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const EvaluateSchema = z.object({
  assessmentId: z.string(),
  expectedRevision: z.number(),
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
    const parsed = EvaluateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "assessmentId and expectedRevision required" } },
        { status: 400 }
      );
    }

    const { assessmentId, expectedRevision } = parsed.data;

    if (assessmentId !== session.assessmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Assessment does not belong to active session" } },
        { status: 403 }
      );
    }

    const result = await DataStore.evaluateAndStoreResult({
      assessmentId,
      expectedRevision,
      ownerId: session.ownerId,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    if (err.message && err.message.includes("Conflict")) {
      return NextResponse.json(
        { error: { code: "STALE_REVISION", message: err.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to evaluate pathway" } },
      { status: 500 }
    );
  }
}
