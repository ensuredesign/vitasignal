"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { ReportStep } from "@/components/assessment/ReportStep";
import { IntakeAnswers, Answer } from "@/lib/clinical/types";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const INITIAL_ANSWERS: IntakeAnswers = {
  suddenSevereTesticularPain: "no",
  painWithNauseaOrVomiting: "no",
  ageBand: "25_34",
  primaryGoal: "general_awareness",
  difficultyConceiving: "no",
  difficultyDuration: "not_applicable",
  newLumpOrSwelling: "no",
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

function AssessmentContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [revision, setRevision] = useState<number>(1);
  const [answers, setAnswers] = useState<IntakeAnswers>(INITIAL_ANSWERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing or initialize demo session
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/assessment");
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setAssessmentId(data.assessment.id);
            setRevision(data.assessment.revision);
            setAnswers(data.assessment.answers);
          }
        } else {
          // If no active session, start default D01
          const startRes = await fetch("/api/demo/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scenarioId: "D01",
              locale: "en",
              syntheticConsent: true,
              adultScenario: true,
              aiConsent: true,
            }),
          });
          const startData = await startRes.json();
          if (startRes.ok) {
            setAssessmentId(startData.assessmentId);
            setRevision(startData.revision);
            setAnswers(startData.answers);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleAnswerChange = (field: keyof IntakeAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const syncAssessment = async (newAnswers = answers) => {
    if (!assessmentId) return;
    try {
      const res = await fetch("/api/assessment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          expectedRevision: revision,
          answers: newAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRevision(data.revision);
      }
    } catch {
      // Background sync
    }
  };

  const handleNextStep = async () => {
    await syncAssessment();
    setStep((s) => s + 1);
  };

  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleEvaluate = async () => {
    if (!assessmentId) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Ensure latest answers synced
      await syncAssessment();

      const res = await fetch("/api/assessment/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          expectedRevision: revision,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to evaluate pathway");
      }

      router.push("/assessment/result");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-offwhite">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-teal animate-spin mx-auto" />
            <p className="text-sm font-medium text-navy">Loading SignalSense Intake...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Four-Step Intake Flow
  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Step Progress Header */}
        <div className="bg-white rounded-xl p-4 border border-navy-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal uppercase tracking-wider">
              {t.common.step} {step} {t.common.of} 4
            </span>
            <h2 className="text-lg font-bold text-navy">
              {step === 1 && t.safetyGate.title}
              {step === 2 && t.assessment.card1Title}
              {step === 3 && t.assessment.card2Title}
              {step === 4 && t.assessment.card4Title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition ${
                  step === i
                    ? "bg-teal ring-2 ring-teal-200"
                    : step > i
                    ? "bg-navy-700"
                    : "bg-navy-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: CRITICAL SAFETY GATE */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Emergency Priority Notice:</strong> Acute testicular symptoms require immediate medical assessment. Any positive flag bypasses routine screening and directs you straight to emergency care.
              </div>
            </div>

            {/* Question 1: Sudden Severe Pain */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">
                {t.safetyGate.suddenPainLabel}
              </label>
              <p className="text-xs text-slate-text">
                {t.safetyGate.suddenPainHelp}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("suddenSevereTesticularPain", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.suddenSevereTesticularPain === val
                        ? val === "yes"
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-teal text-white border-teal shadow-xs"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Pain with Nausea / Vomiting */}
            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.safetyGate.painNauseaLabel}
              </label>
              <p className="text-xs text-slate-text">
                {t.safetyGate.painNauseaHelp}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("painWithNauseaOrVomiting", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.painWithNauseaOrVomiting === val
                        ? val === "yes"
                          ? "bg-red-600 text-white border-red-600 shadow-xs"
                          : "bg-teal text-white border-teal shadow-xs"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTEXT & INTENT */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.ageBandLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "18_24", label: "18–24 years" },
                  { id: "25_34", label: "25–34 years" },
                  { id: "35_44", label: "35–44 years" },
                  { id: "45_54", label: "45–54 years" },
                  { id: "55_plus", label: "55+ years" },
                  { id: "undisclosed", label: "Prefer not to disclose" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAnswerChange("ageBand", item.id)}
                    className={`p-2.5 text-xs font-semibold rounded-lg border transition ${
                      answers.ageBand === item.id
                        ? "bg-teal text-white border-teal shadow-xs"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.goalLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "general_awareness", label: "General Reproductive Awareness" },
                  { id: "planning_if_desired", label: "Future Family Planning (Context)" },
                  { id: "difficulty_conceiving", label: "Experiencing Difficulty Conceiving" },
                  { id: "not_sure", label: "Not sure / Exploring options" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAnswerChange("primaryGoal", item.id)}
                    className={`p-2.5 text-xs font-semibold rounded-lg border text-left transition ${
                      answers.primaryGoal === item.id
                        ? "bg-teal text-white border-teal shadow-xs"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.difficultyConceivingLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("difficultyConceiving", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.difficultyConceiving === val
                        ? "bg-teal text-white border-teal"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UROLOGICAL, ANATOMICAL & METABOLIC HISTORY */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-6">
            {/* Lump / Swelling */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.lumpLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("newLumpOrSwelling", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.newLumpOrSwelling === val
                        ? "bg-teal text-white border-teal"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>

            {/* Surgery */}
            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.surgeryLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("priorTesticularSurgeryOrInjury", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.priorTesticularSurgeryOrInjury === val
                        ? "bg-teal text-white border-teal"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>

            {/* Tobacco */}
            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.tobaccoLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("tobaccoUse", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.tobaccoUse === val
                        ? "bg-teal text-white border-teal"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>

            {/* Occupational Heat */}
            <div className="space-y-2 pt-4 border-t border-navy-50">
              <label className="block text-sm font-bold text-navy">
                {t.assessment.heatLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["no", "yes", "unknown", "prefer_not"] as Answer[]).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange("occupationalHeatExposure", val)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border capitalize transition ${
                      answers.occupationalHeatExposure === val
                        ? "bg-teal text-white border-teal"
                        : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                    }`}
                  >
                    {val === "prefer_not" ? t.common.preferNot : val === "unknown" ? t.common.unknown : val === "yes" ? t.common.yes : t.common.no}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SYNTHETIC LAB REPORT (EVIDENCELENS) */}
        {step === 4 && assessmentId && (
          <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-navy text-lg">
                {t.assessment.card4Title}
              </h3>
              <p className="text-xs text-slate-text">
                {t.assessment.card4Subtitle}
              </p>
            </div>

            <ReportStep
              assessmentId={assessmentId}
              revision={revision}
              onConfirmed={(newRev) => setRevision(newRev)}
            />
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-white border border-navy-200 text-navy text-xs font-bold rounded-xl hover:bg-navy-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-teal text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>{t.common.continue}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isSubmitting}
              className="px-8 py-3 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-900 transition flex items-center gap-2 shadow-md"
            >
              {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Generate Care Pathway & Signals</span>
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <LocaleProvider>
      <AssessmentContent />
    </LocaleProvider>
  );
}
