import { cookies } from "next/headers";

export interface SessionContext {
  ownerId: string;
  sessionId: string;
  assessmentId: string;
}

const SESSION_COOKIE_NAME = "vs_session_ctx";

export async function getSessionContext(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!val) return null;

  try {
    const parsed = JSON.parse(Buffer.from(val, "base64").toString("utf-8"));
    if (parsed.ownerId && parsed.sessionId && parsed.assessmentId) {
      return parsed as SessionContext;
    }
  } catch {
    return null;
  }
  return null;
}

export async function setSessionContext(ctx: SessionContext) {
  const cookieStore = await cookies();
  const serialized = Buffer.from(JSON.stringify(ctx)).toString("base64");
  cookieStore.set(SESSION_COOKIE_NAME, serialized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export async function clearSessionContext() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
