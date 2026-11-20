import { z } from "zod";

export const AnswerSchema = z.enum(["yes", "no", "unknown", "prefer_not"]);
export type Answer = z.infer<typeof AnswerSchema>;

export const AgeBandSchema = z.enum([
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_plus",
  "undisclosed",
]);
export type AgeBand = z.infer<typeof AgeBandSchema>;

export const DurationBandSchema = z.enum([
  "under_12_months",
  "12_plus_months",
  "unknown",
  "not_applicable",
  "prefer_not",
]);
export type DurationBand = z.infer<typeof DurationBandSchema>;

export const GoalSchema = z.enum([
  "general_awareness",
  "planning_if_desired",
  "difficulty_conceiving",
  "not_sure",
  "prefer_not",
]);
export type Goal = z.infer<typeof GoalSchema>;

export const PathwaySchema = z.enum([
  "urgent",
  "clarify_safety",
  "urology_andrology",
  "fertility_services",
  "primary_care",
  "needs_clarification",
  "education",
]);
export type Pathway = z.infer<typeof PathwaySchema>;

export const ReportFlagSchema = z.enum(["abnormal", "normal", "not_reported", "unclear"]);
export type ReportFlag = z.infer<typeof ReportFlagSchema>;

export const ConfirmedObservationSchema = z.object({
  id: z.string(),
  field: z.string(),
  rawValue: z.string(),
  unit: z.string().nullable(),
  reportedFlag: ReportFlagSchema,
  evidenceQuote: z.string(),
  page: z.number().nullable(),
  userConfirmed: z.boolean(),
});
export type ConfirmedObservation = z.infer<typeof ConfirmedObservationSchema>;

export const IntakeAnswersSchema = z.object({
  // Safety Gate (Priority 1 & 2)
  suddenSevereTesticularPain: AnswerSchema,
  painWithNauseaOrVomiting: AnswerSchema,

  // Demographics (Non-discriminatory context only)
  ageBand: AgeBandSchema.default("undisclosed"),

  // Primary intent & reproductive concern
  primaryGoal: GoalSchema.default("not_sure"),
  difficultyConceiving: AnswerSchema.default("no"),
  difficultyDuration: DurationBandSchema.default("not_applicable"),

  // Urological & anatomical history (Priority 3)
  newLumpOrSwelling: AnswerSchema.default("no"),
  priorTesticularSurgeryOrInjury: AnswerSchema.default("no"),
  undescendedTestis: AnswerSchema.default("no"),
  priorGonadotoxicTreatment: AnswerSchema.default("no"),
  clinicianNotedSemenAbnormality: AnswerSchema.default("no"),

  // Primary care, lifestyle & metabolic risks (Priority 5)
  sexualOrEjaculatoryConcern: AnswerSchema.default("no"),
  diabetesOrMetabolicCondition: AnswerSchema.default("no"),
  previousGenitourinaryInfection: AnswerSchema.default("no"),
  tobaccoUse: AnswerSchema.default("no"),
  occupationalHeatExposure: AnswerSchema.default("no"),
  anabolicSteroidOrTestosteroneUse: AnswerSchema.default("no"),
});
export type IntakeAnswers = z.infer<typeof IntakeAnswersSchema>;

export const FindingSchema = z.object({
  ruleId: z.string(),
  category: z.string(),
  answerKey: z.string(),
  observed: z.string(),
  origin: z.enum(["intake", "confirmed_report"]),
  sourceIds: z.array(z.string()),
  messageKey: z.string(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const AssessmentResultSchema = z.object({
  pathway: PathwaySchema,
  alternatives: z.array(PathwaySchema),
  findings: z.array(FindingSchema),
  missing: z.array(z.string()),
  ruleVersion: z.string(),
  revision: z.number(),
  generatedAt: z.string(),
  requiresClinicalReview: z.literal(true),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
