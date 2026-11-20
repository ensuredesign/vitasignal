import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const ConfirmSchema = z.object({
  extractionId: z.string(),
  assessmentId: z.string(),
  acceptedCandidateIds: z.array(z.string()),
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
    const parsed = ConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid confirmation parameters" } },
        { status: 400 }
      );
    }

    const { extractionId, assessmentId, acceptedCandidateIds } = parsed.data;

    if (assessmentId !== session.assessmentId) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Assessment does not belong to session" } },
        { status: 403 }
      );
    }

    const result = await DataStore.confirmReportObservations({
      extractionId,
      assessmentId,
      acceptedCandidateIds,
      ownerId: session.ownerId,
    });

    return NextResponse.json({
      success: true,
      confirmedCount: result.confirmedCount,
      newRevision: result.newRevision,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "CONFIRM_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
