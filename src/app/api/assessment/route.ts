import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { IntakeAnswersSchema } from "@/lib/clinical/types";
import { getSessionContext } from "@/lib/auth/session";

const PatchAssessmentSchema = z.object({
  assessmentId: z.string(),
  expectedRevision: z.number(),
  answers: IntakeAnswersSchema,
});

export async function PATCH(req: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Active session required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = PatchAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Invalid intake answers format", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { assessmentId, expectedRevision, answers } = parsed.data;

    // Verify ownership
    if (assessmentId !== session.assessmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Assessment does not belong to active session" } },
        { status: 403 }
      );
    }

    const result = await DataStore.updateAssessmentAnswers({
      assessmentId,
      expectedRevision,
      answers,
      ownerId: session.ownerId,
    });

    return NextResponse.json({
      success: true,
      revision: result.revision,
    });
  } catch (err: any) {
    if (err.message && err.message.includes("Conflict")) {
      return NextResponse.json(
        { error: { code: "STALE_REVISION", message: err.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to update assessment" } },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ assessment: null });
    }

    const record = await DataStore.getAssessment(session.assessmentId, session.ownerId);
    if (!record) {
      return NextResponse.json({ assessment: null });
    }

    return NextResponse.json({ assessment: record });
  } catch (err: any) {
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
