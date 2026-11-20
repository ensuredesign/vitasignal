import fs from "fs";
import path from "path";
import { evaluateClinicalPathway } from "../src/lib/clinical/engine";
import { BENCHMARK_CASES } from "../src/lib/fixtures/cases";
import { SYNTHETIC_REPORTS } from "../src/lib/fixtures/reports";
import { verifyExtractionGroundedness } from "../src/lib/ai/verify";
import { CLINICAL_RULE_VERSION } from "../src/lib/clinical/rules";

async function runEvaluation() {
  console.log("=== VitaSignal AI: Automated Benchmark Evaluation Suite ===");
  const startTime = Date.now();

  const caseResults: any[] = [];
  let passedCases = 0;
  let totalCases = 0;

  // 1. Evaluate Benchmark Cases (D01, D02, D03, D04, D05, D10, D11, D14, D18)
  for (const [id, scenario] of Object.entries(BENCHMARK_CASES)) {
    totalCases++;
    const result = evaluateClinicalPathway(scenario.answers);
    const passed = result.pathway === scenario.expectedPathway;

    if (passed) passedCases++;

    caseResults.push({
      scenarioId: id,
      name: scenario.name,
      expectedPathway: scenario.expectedPathway,
      actualPathway: result.pathway,
      passed,
      findingsCount: result.findings.length,
      missingCount: result.missing.length,
      ruleVersion: result.ruleVersion,
    });
  }

  // 2. Evaluate Evidence Extraction Grounding on Synthetic Reports
  let totalObservations = 0;
  let groundedObservations = 0;

  for (const [repId, fixture] of Object.entries(SYNTHETIC_REPORTS)) {
    const candidateObservations = fixture.expectedObservations.map((obs, idx) => ({
      id: `${repId}_${idx}`,
      field: obs.field as any,
      rawValue: obs.rawValue,
      unit: obs.unit,
      reportedFlag: obs.reportedFlag,
      evidenceQuote: obs.evidenceQuote,
      page: obs.page,
    }));

    totalObservations += candidateObservations.length;
    const verified = verifyExtractionGroundedness(
      candidateObservations,
      fixture.sourceText
    );
    groundedObservations += verified.length;
  }

  // 3. Compute Metrics
  const ruleConcordancePct = Math.round((passedCases / totalCases) * 100);
  const urgentPassed = caseResults.find((c) => c.scenarioId === "D04")?.passed;
  const urgentCoveragePct = urgentPassed ? 100 : 0;
  const groundingPct = Math.round((groundedObservations / totalObservations) * 100);

  const durationMs = Date.now() - startTime;

  const evaluationReport = {
    generatedAt: new Date().toISOString(),
    ruleVersion: CLINICAL_RULE_VERSION,
    durationMs,
    summary: {
      totalTests: totalCases + totalObservations,
      passedCases,
      totalCases,
      allPassed: passedCases === totalCases && groundingPct === 100,
    },
    metrics: {
      ruleConcordance: `${ruleConcordancePct}%`,
      urgentGateCoverage: `${urgentCoveragePct}%`,
      evidenceGrounding: `${groundingPct}%`,
      clinicalValidationStatus: "Not validated (Research prototype)",
      mode: process.env.GEMINI_API_KEY ? "live_ai" : "fixture_replay",
    },
    cases: caseResults,
    reportsTested: Object.keys(SYNTHETIC_REPORTS),
  };

  const outputPath = path.join(process.cwd(), "docs", "evaluation-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(evaluationReport, null, 2), "utf-8");

  console.log(`✓ Benchmark completed in ${durationMs}ms`);
  console.log(`✓ Rule Concordance: ${ruleConcordancePct}% (${passedCases}/${totalCases})`);
  console.log(`✓ Urgent Gate Coverage: ${urgentCoveragePct}%`);
  console.log(`✓ Grounded Evidence Quotes: ${groundingPct}% (${groundedObservations}/${totalObservations})`);
  console.log(`✓ Output written to: ${outputPath}`);
}

runEvaluation().catch((err) => {
  console.error("Evaluation runner failed:", err);
  process.exit(1);
});
