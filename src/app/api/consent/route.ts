import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const ConsentSchema = z.object({
  type: z.enum(["synthetic_processing", "external_ai", "sharing"]),
  granted: z.boolean(),
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
    const parsed = ConsentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid consent parameters" } },
        { status: 400 }
      );
    }

    const { type, granted } = parsed.data;

    await DataStore.recordConsent(session.ownerId, session.sessionId, type, granted);

    return NextResponse.json({ success: true, type, granted });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
