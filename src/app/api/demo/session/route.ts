import { NextResponse } from "next/server";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext, clearSessionContext } from "@/lib/auth/session";

export async function DELETE() {
  try {
    const session = await getSessionContext();
    if (!session) {
      await clearSessionContext();
      return NextResponse.json({ success: true, message: "No active session to delete" });
    }

    // Permanently delete session and cascaded records
    await DataStore.deleteDemoSession(session.sessionId, session.ownerId);

    // Clear session cookie
    await clearSessionContext();

    return NextResponse.json({
      success: true,
      message: "Session and synthetic data permanently purged",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
