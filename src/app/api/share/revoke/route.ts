import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { getSessionContext } from "@/lib/auth/session";

const RevokeSchema = z.object({
  shareId: z.string(),
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
    const parsed = RevokeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "shareId required" } },
        { status: 400 }
      );
    }

    await DataStore.revokeCareShare(parsed.data.shareId, session.ownerId);

    return NextResponse.json({ success: true, status: "revoked" });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "REVOKE_FAILED", message: err.message } },
      { status: 500 }
    );
  }
}
