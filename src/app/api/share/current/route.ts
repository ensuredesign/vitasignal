import { NextResponse } from "next/server";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Active session required" } },
        { status: 401 }
      );
    }

    const activeShare = await DataStore.getActiveCareShare(session.assessmentId, session.ownerId);
    if (!activeShare) {
      return NextResponse.json(
        { error: { code: "NO_ACTIVE_SHARE", message: "No active unexpired share found" } },
        { status: 404 }
      );
    }

    const events = await DataStore.getCareEvents(activeShare.id, session.ownerId);

    return NextResponse.json({
      share: activeShare,
      events,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
