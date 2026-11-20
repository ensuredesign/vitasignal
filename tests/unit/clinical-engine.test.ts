import { describe, it, expect } from "vitest";
import { evaluateClinicalPathway } from "../../src/lib/clinical/engine";
import { IntakeAnswers, ConfirmedObservation } from "../../src/lib/clinical/types";
import { BENCHMARK_CASES } from "../../src/lib/fixtures/cases";

describe("Gate 1: Clinical & Safety Rule Engine", () => {
  it("D04: Acute severe testicular pain triggers immediate urgent emergency gate", () => {
    const scenario = BENCHMARK_CASES["D04"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("urgent");
    expect(result.findings.some((f) => f.ruleId === "SAFE-01")).toBe(true);
    expect(result.findings.some((f) => f.sourceIds.includes("C4"))).toBe(true);
    expect(result.requiresClinicalReview).toBe(true);
  });

  it("D05: Unresolved / unknown acute safety answers trigger clarify_safety with no false reassurance", () => {
    const scenario = BENCHMARK_CASES["D05"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("clarify_safety");
    expect(result.findings.some((f) => f.ruleId === "SAFE-02")).toBe(true);
    expect(result.pathway).not.toBe("education");
    expect(result.pathway).not.toBe("primary_care");
  });

  it("D01: Tobacco & heat exposure route to primary care discussion without fertility prediction", () => {
    const scenario = BENCHMARK_CASES["D01"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("primary_care");
    expect(result.findings.some((f) => f.ruleId === "PCP-01")).toBe(true);
    expect(result.findings.some((f) => f.answerKey === "tobaccoUse")).toBe(true);
    expect(result.findings.some((f) => f.answerKey === "occupationalHeatExposure")).toBe(true);
  });

  it("D02: Prior testicular surgery routes to urology/andrology specialist evaluation", () => {
    const scenario = BENCHMARK_CASES["D02"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("urology_andrology");
    expect(result.findings.some((f) => f.ruleId === "SPEC-01")).toBe(true);
    expect(result.findings.some((f) => f.sourceIds.includes("C2"))).toBe(true);
  });

  it("D03: Difficulty conceiving routes to fertility services without partner assumptions", () => {
    const scenario = BENCHMARK_CASES["D03"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("fertility_services");
    expect(result.findings.some((f) => f.ruleId === "FERT-01")).toBe(true);
    expect(result.findings.some((f) => f.sourceIds.includes("C1"))).toBe(true);
  });

  it("D10: All negative completed assessment routes to routine preventive education", () => {
    const scenario = BENCHMARK_CASES["D10"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("education");
    expect(result.findings.some((f) => f.ruleId === "EDU-01")).toBe(true);
    expect(result.missing.length).toBe(0);
  });

  it("D11: Incomplete non-urgent history routes to needs_clarification", () => {
    const scenario = BENCHMARK_CASES["D11"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("needs_clarification");
    expect(result.findings.some((f) => f.ruleId === "DATA-01")).toBe(true);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it("D14: Age invariance check: identical clinical facts yield identical pathway regardless of age band", () => {
    const baseScenario = BENCHMARK_CASES["D01"]; // ageBand: 25_34
    const ageScenario = BENCHMARK_CASES["D14"]; // ageBand: 55_plus

    const resBase = evaluateClinicalPathway(baseScenario.answers);
    const resAge = evaluateClinicalPathway(ageScenario.answers);

    expect(resBase.pathway).toBe("primary_care");
    expect(resAge.pathway).toBe("primary_care");
    expect(resBase.findings.map((f) => f.ruleId)).toEqual(resAge.findings.map((f) => f.ruleId));
  });

  it("D18: New lump or swelling routes to timely urology assessment (not cancer diagnosis)", () => {
    const scenario = BENCHMARK_CASES["D18"];
    const result = evaluateClinicalPathway(scenario.answers);

    expect(result.pathway).toBe("urology_andrology");
    expect(result.findings.some((f) => f.answerKey === "newLumpOrSwelling")).toBe(true);
    expect(result.findings.some((f) => f.sourceIds.includes("C5"))).toBe(true);
  });

  describe("Conflict Precedence and Secondary Pathways", () => {
    it("Acute severe pain strictly overrides lump, fertility concerns, and metabolic history", () => {
      const answers: IntakeAnswers = {
        suddenSevereTesticularPain: "yes",
        painWithNauseaOrVomiting: "yes",
        ageBand: "25_34",
        primaryGoal: "difficulty_conceiving",
        difficultyConceiving: "yes",
        difficultyDuration: "12_plus_months",
        newLumpOrSwelling: "yes",
        priorTesticularSurgeryOrInjury: "yes",
        undescendedTestis: "no",
        priorGonadotoxicTreatment: "no",
        clinicianNotedSemenAbnormality: "no",
        sexualOrEjaculatoryConcern: "no",
        diabetesOrMetabolicCondition: "yes",
        previousGenitourinaryInfection: "no",
        tobaccoUse: "yes",
        occupationalHeatExposure: "yes",
        anabolicSteroidOrTestosteroneUse: "no",
      };

      const result = evaluateClinicalPathway(answers);
      expect(result.pathway).toBe("urgent");
      expect(result.alternatives).toEqual([]); // No routine alternatives permitted on urgent route
    });

    it("Urology flag dominates fertility concern but lists fertility_services in alternatives", () => {
      const answers: IntakeAnswers = {
        suddenSevereTesticularPain: "no",
        painWithNauseaOrVomiting: "no",
        ageBand: "25_34",
        primaryGoal: "difficulty_conceiving",
        difficultyConceiving: "yes",
        difficultyDuration: "12_plus_months",
        newLumpOrSwelling: "yes",
        priorTesticularSurgeryOrInjury: "no",
        undescendedTestis: "no",
        priorGonadotoxicTreatment: "no",
        clinicianNotedSemenAbnormality: "no",
        sexualOrEjaculatoryConcern: "no",
        diabetesOrMetabolicCondition: "no",
        previousGenitourinaryInfection: "no",
        tobaccoUse: "no",
        occupationalHeatExposure: "no",
        anabolicSteroidOrTestosteroneUse: "no",
      };

      const result = evaluateClinicalPathway(answers);
      expect(result.pathway).toBe("urology_andrology");
      expect(result.alternatives).toContain("fertility_services");
    });

    it("Confirmed lab-explicit abnormal observation activates SPEC-01", () => {
      const baseAnswers: IntakeAnswers = {
        ...BENCHMARK_CASES["D10"].answers,
      };

      const confirmedObs: ConfirmedObservation[] = [
        {
          id: "obs-1",
          field: "sperm_concentration",
          rawValue: "8.5",
          unit: "M/mL",
          reportedFlag: "abnormal",
          evidenceQuote: "Sperm Concentration: 8.5 M/mL [ABNORMAL - Low]",
          page: 1,
          userConfirmed: true,
        },
      ];

      const result = evaluateClinicalPathway(baseAnswers, confirmedObs);
      expect(result.pathway).toBe("urology_andrology");
      expect(result.findings.some((f) => f.origin === "confirmed_report")).toBe(true);
    });

    it("Unconfirmed lab abnormal observation does NOT activate SPEC-01", () => {
      const baseAnswers: IntakeAnswers = {
        ...BENCHMARK_CASES["D10"].answers,
      };

      const unconfirmedObs: ConfirmedObservation[] = [
        {
          id: "obs-1",
          field: "sperm_concentration",
          rawValue: "8.5",
          unit: "M/mL",
          reportedFlag: "abnormal",
          evidenceQuote: "Sperm Concentration: 8.5 M/mL [ABNORMAL - Low]",
          page: 1,
          userConfirmed: false, // NOT confirmed
        },
      ];

      const result = evaluateClinicalPathway(baseAnswers, unconfirmedObs);
      expect(result.pathway).toBe("education"); // Remains education because unconfirmed
    });
  });
});
