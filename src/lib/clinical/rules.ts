import { IntakeAnswers, ConfirmedObservation, Finding } from "./types";

export const CLINICAL_RULE_VERSION = "2026.11-v1";

export interface RuleDefinition {
  id: string;
  name: string;
  priority: number;
  category: string;
  sourceIds: string[];
  rationaleKey: string;
}

export const RULES: Record<string, RuleDefinition> = {
  "SAFE-01": {
    id: "SAFE-01",
    name: "Urgent Acute Testicular Symptoms",
    priority: 1,
    category: "urgent_safety",
    sourceIds: ["C4"],
    rationaleKey: "safe_01_urgent_rationale",
  },
  "SAFE-02": {
    id: "SAFE-02",
    name: "Unresolved Acute Safety Status",
    priority: 2,
    category: "safety_clarification",
    sourceIds: ["C4"],
    rationaleKey: "safe_02_clarify_rationale",
  },
  "SPEC-01": {
    id: "SPEC-01",
    name: "Urological / Anatomical Assessment Indicator",
    priority: 3,
    category: "specialist_evaluation",
    sourceIds: ["C2", "C3", "C5"],
    rationaleKey: "spec_01_urology_rationale",
  },
  "FERT-01": {
    id: "FERT-01",
    name: "Reproductive & Fertility Evaluation Indicator",
    priority: 4,
    category: "fertility_evaluation",
    sourceIds: ["C1", "C2"],
    rationaleKey: "fert_01_fertility_rationale",
  },
  "PCP-01": {
    id: "PCP-01",
    name: "Preventive Care & Health Optimization Indicator",
    priority: 5,
    category: "primary_care",
    sourceIds: ["C1", "C2", "C3"],
    rationaleKey: "pcp_01_primary_care_rationale",
  },
  "DATA-01": {
    id: "DATA-01",
    name: "Incomplete History or Unverified Data",
    priority: 6,
    category: "data_clarification",
    sourceIds: ["C1"],
    rationaleKey: "data_01_clarification_rationale",
  },
  "EDU-01": {
    id: "EDU-01",
    name: "Routine Preventive Awareness",
    priority: 7,
    category: "preventive_education",
    sourceIds: ["C1", "C2", "C3"],
    rationaleKey: "edu_01_education_rationale",
  },
};
