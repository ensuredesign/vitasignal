import { NextResponse } from "next/server";
import { z } from "zod";
import { DataStore } from "@/lib/persistence/store";
import { BENCHMARK_CASES } from "@/lib/fixtures/cases";
import { setSessionContext } from "@/lib/auth/session";

const StartDemoSchema = z.object({
  scenarioId: z.string().default("D01"),
  locale: z.enum(["en", "ar"]).default("en"),
  syntheticConsent: z.literal(true),
  adultScenario: z.literal(true),
  aiConsent: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = StartDemoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Consent and adult acknowledgement required" } },
        { status: 400 }
      );
    }

    const { scenarioId, locale, aiConsent } = parsed.data;
    const scenario = BENCHMARK_CASES[scenarioId] || BENCHMARK_CASES["D01"];
    const ownerId = "usr_" + Math.random().toString(36).substring(2, 12);

    const sessionData = await DataStore.createDemoSession({
      ownerId,
      scenarioId,
      locale,
      initialAnswers: scenario.answers,
      aiConsent,
    });

    // Set secure cookie context
    await setSessionContext({
      ownerId,
      sessionId: sessionData.sessionId,
      assessmentId: sessionData.assessmentId,
    });

    return NextResponse.json({
      success: true,
      ...sessionData,
      scenarioId,
      answers: scenario.answers,
      persistence: DataStore.getPersistenceMode(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: err.message || "Failed to start demo session" } },
      { status: 500 }
    );
  }
}
