import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const CareEventSchema = z.object({
  shareId: z.string(),
  eventType: z.enum(["shared", "acknowledged", "simulated_scheduled", "simulated_completed"]),
  idempotencyKey: z.string(),
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
    const parsed = CareEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid care event parameters" } },
        { status: 400 }
      );
    }

    const { shareId, eventType, idempotencyKey } = parsed.data;

    const eventRecord = await DataStore.addCareEvent({
      shareId,
      eventType,
      idempotencyKey,
      ownerId: session.ownerId,
      actor: "simulated_coordinator",
    });

    return NextResponse.json({
      success: true,
      event: eventRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "EVENT_FAILED", message: err.message } },
      { status: 400 }
    );
  }
}
