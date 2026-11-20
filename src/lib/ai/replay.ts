import { SYNTHETIC_REPORTS } from "../fixtures/reports";
import { ExtractionResponse } from "./verify";

/**
 * Replay provider delivering pre-verified observations for allowlisted fixtures.
 * Used when GEMINI_API_KEY is not configured or in offline test environments.
 */
export function getReplayExtraction(fixtureId: string): ExtractionResponse {
  const fixture = SYNTHETIC_REPORTS[fixtureId];
  if (!fixture) {
    throw new Error(`Unknown synthetic report fixture ID: ${fixtureId}`);
  }

  const observations = fixture.expectedObservations.map((obs, idx) => ({
    id: `cand_${fixtureId}_${idx + 1}`,
    field: obs.field as any,
    rawValue: obs.rawValue,
    unit: obs.unit,
    reportedFlag: obs.reportedFlag,
    evidenceQuote: obs.evidenceQuote,
    page: obs.page,
  }));

  return {
    observations,
    unreadable: false,
  };
}
