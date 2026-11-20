import {
  IntakeAnswers,
  ConfirmedObservation,
  AssessmentResult,
  Finding,
  Pathway,
} from "./types";
import { CLINICAL_RULE_VERSION } from "./rules";

/**
 * Pure, deterministic clinical decision engine.
 * Maps structured intake answers and confirmed synthetic report observations
 * to safety and care pathways according to authoritative guidance (WHO, ASRM/AUA, EAU, NHS).
 * 
 * Never makes a diagnosis. Never computes a fertility score.
 */
export function evaluateClinicalPathway(
  answers: IntakeAnswers,
  confirmedObservations: ConfirmedObservation[] = [],
  revision = 1
): AssessmentResult {
  const findings: Finding[] = [];
  const missing: string[] = [];

  // 1. Identify missing / unknown responses across all intake inputs
  const answerEntries = Object.entries(answers) as [keyof IntakeAnswers, string][];
  for (const [key, value] of answerEntries) {
    if (value === "unknown" || value === "prefer_not") {
      missing.push(key);
    }
  }

  // -------------------------------------------------------------
  // Priority 1 / SAFE-01: Urgent Acute Testicular Symptoms
  // -------------------------------------------------------------
  const isUrgent =
    answers.suddenSevereTesticularPain === "yes" ||
    answers.painWithNauseaOrVomiting === "yes";

  if (isUrgent) {
    if (answers.suddenSevereTesticularPain === "yes") {
      findings.push({
        ruleId: "SAFE-01",
        category: "urgent_safety",
        answerKey: "suddenSevereTesticularPain",
        observed: "Reported sudden severe testicular pain",
        origin: "intake",
        sourceIds: ["C4"],
        messageKey: "finding_sudden_severe_pain",
      });
    }
    if (answers.painWithNauseaOrVomiting === "yes") {
      findings.push({
        ruleId: "SAFE-01",
        category: "urgent_safety",
        answerKey: "painWithNauseaOrVomiting",
        observed: "Reported testicular pain accompanied by nausea or vomiting",
        origin: "intake",
        sourceIds: ["C4"],
        messageKey: "finding_pain_with_nausea",
      });
    }

    return {
      pathway: "urgent",
      alternatives: [],
      findings,
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  // -------------------------------------------------------------
  // Priority 2 / SAFE-02: Safety Gate Incomplete
  // -------------------------------------------------------------
  const isSafetyUnclear =
    answers.suddenSevereTesticularPain === "unknown" ||
    answers.suddenSevereTesticularPain === "prefer_not" ||
    answers.painWithNauseaOrVomiting === "unknown" ||
    answers.painWithNauseaOrVomiting === "prefer_not";

  if (isSafetyUnclear) {
    findings.push({
      ruleId: "SAFE-02",
      category: "safety_clarification",
      answerKey: "safetyGate",
      observed: "Acute safety symptom questions were unanswered or marked unknown/prefer not to answer",
      origin: "intake",
      sourceIds: ["C4"],
      messageKey: "finding_safety_unresolved",
    });

    return {
      pathway: "clarify_safety",
      alternatives: [],
      findings,
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  // -------------------------------------------------------------
  // Priority 3 / SPEC-01: Urology / Andrology Specialist Indicator
  // -------------------------------------------------------------
  const specFindings: Finding[] = [];

  if (answers.newLumpOrSwelling === "yes") {
    specFindings.push({
      ruleId: "SPEC-01",
      category: "specialist_evaluation",
      answerKey: "newLumpOrSwelling",
      observed: "Reported a new lump or swelling in the testicle or scrotum",
      origin: "intake",
      sourceIds: ["C5"],
      messageKey: "finding_new_lump",
    });
  }

  if (answers.priorTesticularSurgeryOrInjury === "yes") {
    specFindings.push({
      ruleId: "SPEC-01",
      category: "specialist_evaluation",
      answerKey: "priorTesticularSurgeryOrInjury",
      observed: "History of prior testicular surgery or traumatic injury",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_prior_surgery",
    });
  }

  if (answers.undescendedTestis === "yes") {
    specFindings.push({
      ruleId: "SPEC-01",
      category: "specialist_evaluation",
      answerKey: "undescendedTestis",
      observed: "History of cryptorchidism (undescended testis)",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_undescended_testis",
    });
  }

  if (answers.priorGonadotoxicTreatment === "yes") {
    specFindings.push({
      ruleId: "SPEC-01",
      category: "specialist_evaluation",
      answerKey: "priorGonadotoxicTreatment",
      observed: "History of gonadotoxic medical treatments (chemotherapy or radiation)",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_gonadotoxic_treatment",
    });
  }

  if (answers.clinicianNotedSemenAbnormality === "yes") {
    specFindings.push({
      ruleId: "SPEC-01",
      category: "specialist_evaluation",
      answerKey: "clinicianNotedSemenAbnormality",
      observed: "Prior clinician-identified semen analysis abnormality",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_clinician_noted_semen_abnormality",
    });
  }

  // Check confirmed lab observations for explicit lab-flagged abnormalities
  for (const obs of confirmedObservations) {
    if (obs.userConfirmed && obs.reportedFlag === "abnormal") {
      specFindings.push({
        ruleId: "SPEC-01",
        category: "specialist_evaluation",
        answerKey: obs.field,
        observed: `Confirmed report finding explicitly flagged abnormal: ${obs.field} = ${obs.rawValue}${obs.unit ? " " + obs.unit : ""}`,
        origin: "confirmed_report",
        sourceIds: ["C2", "C3"],
        messageKey: "finding_confirmed_report_abnormal",
      });
    }
  }

  // -------------------------------------------------------------
  // Priority 4 / FERT-01: Fertility Evaluation Indicator
  // -------------------------------------------------------------
  const fertFindings: Finding[] = [];
  if (
    answers.difficultyConceiving === "yes" ||
    answers.primaryGoal === "difficulty_conceiving"
  ) {
    fertFindings.push({
      ruleId: "FERT-01",
      category: "fertility_evaluation",
      answerKey: "difficultyConceiving",
      observed:
        answers.difficultyDuration === "12_plus_months"
          ? "Reported difficulty conceiving (12+ months duration noted as context)"
          : "Reported difficulty conceiving or primary goal of seeking fertility evaluation",
      origin: "intake",
      sourceIds: ["C1", "C2"],
      messageKey: "finding_fertility_evaluation_needed",
    });
  }

  // -------------------------------------------------------------
  // Priority 5 / PCP-01: Primary Care & Lifestyle Risk Indicators
  // -------------------------------------------------------------
  const pcpFindings: Finding[] = [];

  if (answers.diabetesOrMetabolicCondition === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "diabetesOrMetabolicCondition",
      observed: "Reported diabetes or metabolic health condition",
      origin: "intake",
      sourceIds: ["C1", "C3"],
      messageKey: "finding_metabolic_condition",
    });
  }

  if (answers.previousGenitourinaryInfection === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "previousGenitourinaryInfection",
      observed: "History of prior genitourinary infection",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_genitourinary_infection",
    });
  }

  if (answers.tobaccoUse === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "tobaccoUse",
      observed: "Current tobacco or nicotine use",
      origin: "intake",
      sourceIds: ["C1", "C2"],
      messageKey: "finding_tobacco_use",
    });
  }

  if (answers.occupationalHeatExposure === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "occupationalHeatExposure",
      observed: "Regular occupational heat exposure",
      origin: "intake",
      sourceIds: ["C1", "C2"],
      messageKey: "finding_heat_exposure",
    });
  }

  if (answers.anabolicSteroidOrTestosteroneUse === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "anabolicSteroidOrTestosteroneUse",
      observed: "Current or recent anabolic steroid or exogenous testosterone use",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_anabolic_use",
    });
  }

  if (answers.sexualOrEjaculatoryConcern === "yes") {
    pcpFindings.push({
      ruleId: "PCP-01",
      category: "primary_care",
      answerKey: "sexualOrEjaculatoryConcern",
      observed: "Reported sexual or ejaculatory concern",
      origin: "intake",
      sourceIds: ["C2", "C3"],
      messageKey: "finding_sexual_ejaculatory_concern",
    });
  }

  // -------------------------------------------------------------
  // Decision Precedence & Alternative Routes
  // -------------------------------------------------------------
  if (specFindings.length > 0) {
    const alternatives: Pathway[] = [];
    if (fertFindings.length > 0) alternatives.push("fertility_services");
    if (pcpFindings.length > 0) alternatives.push("primary_care");

    return {
      pathway: "urology_andrology",
      alternatives,
      findings: [...specFindings, ...fertFindings, ...pcpFindings],
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  if (fertFindings.length > 0) {
    const alternatives: Pathway[] = [];
    if (pcpFindings.length > 0) alternatives.push("primary_care");

    return {
      pathway: "fertility_services",
      alternatives,
      findings: [...fertFindings, ...pcpFindings],
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  if (pcpFindings.length > 0) {
    return {
      pathway: "primary_care",
      alternatives: ["education"],
      findings: pcpFindings,
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  // Priority 6 / DATA-01: Any key history omitted or unconfirmed conflicting signals
  if (missing.length > 0) {
    findings.push({
      ruleId: "DATA-01",
      category: "data_clarification",
      answerKey: "missingItems",
      observed: `${missing.length} question(s) were unanswered or marked prefer not to answer/unknown`,
      origin: "intake",
      sourceIds: ["C1"],
      messageKey: "finding_data_clarification_needed",
    });

    return {
      pathway: "needs_clarification",
      alternatives: ["education", "primary_care"],
      findings,
      missing,
      ruleVersion: CLINICAL_RULE_VERSION,
      revision,
      generatedAt: new Date().toISOString(),
      requiresClinicalReview: true,
    };
  }

  // Priority 7 / EDU-01: Routine Preventive Awareness
  findings.push({
    ruleId: "EDU-01",
    category: "preventive_education",
    answerKey: "allNegative",
    observed: "No acute symptoms, urological flags, or reproductive risk signals reported in completed assessment",
    origin: "intake",
    sourceIds: ["C1", "C2", "C3"],
    messageKey: "finding_routine_education",
  });

  return {
    pathway: "education",
    alternatives: ["primary_care"],
    findings,
    missing,
    ruleVersion: CLINICAL_RULE_VERSION,
    revision,
    generatedAt: new Date().toISOString(),
    requiresClinicalReview: true,
  };
}
