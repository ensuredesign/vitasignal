import { z } from "zod";

export const ExtractionObservationSchema = z.object({
  id: z.string().optional(),
  field: z.enum([
    "semen_volume",
    "sperm_concentration",
    "total_motility",
    "progressive_motility",
    "morphology",
    "other_known_field",
  ]),
  rawValue: z.string(),
  unit: z.string().nullable(),
  reportedFlag: z.enum(["abnormal", "normal", "not_reported", "unclear"]),
  evidenceQuote: z.string(),
  page: z.number().nullable().default(1),
});

export const ExtractionResponseSchema = z.object({
  observations: z.array(ExtractionObservationSchema).max(12),
  unreadable: z.boolean().default(false),
});

export type ExtractionResponse = z.infer<typeof ExtractionResponseSchema>;

/**
 * Normalizes whitespace for substring search while preserving word tokens.
 */
function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Validates that every extracted observation quote is an exact, grounded substring
 * in the trusted curated fixture, and that the observed value appears in that quote.
 */
export function verifyExtractionGroundedness(
  observations: z.infer<typeof ExtractionObservationSchema>[],
  sourceFixtureText: string
): z.infer<typeof ExtractionObservationSchema>[] {
  const normalizedSource = normalizeText(sourceFixtureText);

  return observations.filter((obs) => {
    if (!obs.evidenceQuote || obs.evidenceQuote.trim().length === 0) {
      return false;
    }

    const normalizedQuote = normalizeText(obs.evidenceQuote);

    // 1. Verbatim quote grounding check
    if (!normalizedSource.includes(normalizedQuote)) {
      return false;
    }

    // 2. Value presence inside the cited quote
    if (obs.rawValue && !normalizedQuote.includes(obs.rawValue)) {
      return false;
    }

    return true;
  });
}
