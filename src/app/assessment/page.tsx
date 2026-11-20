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
  Sparkles,
  RefreshCw,
  HeartPulse,
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
      <div className="min-h-screen flex flex-col bg-surface-base">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#2BA8A2] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#14283F]">Loading SignalSense Intake...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Answer button renderer with Flip7 pill styling
  const renderPillChoices = (
    field: keyof IntakeAnswers,
    isUrgentQuestion = false
  ) => {
    const currentVal = answers[field];
    const options: { val: Answer; label: string }[] = [
      { val: "no", label: t.common.no },
      { val: "yes", label: t.common.yes },
      { val: "unknown", label: t.common.unknown },
      { val: "prefer_not", label: t.common.preferNot },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        {options.map((opt) => {
          const isSelected = currentVal === opt.val;
          let activeClass = "bg-white text-slate-text border-2 border-[#E8F6F5] hover:border-[#2BA8A2]/40";

          if (isSelected) {
            if (opt.val === "yes" && isUrgentQuestion) {
              activeClass = "bg-[#EF6C4A] text-white border-2 border-[#EF6C4A] shadow-coral-glow";
            } else if (opt.val === "yes") {
              activeClass = "bg-[#2BA8A2] text-white border-2 border-[#2BA8A2] shadow-teal-glow";
            } else if (opt.val === "no") {
              activeClass = "bg-[#1E8C86] text-white border-2 border-[#1E8C86] shadow-teal-glow";
            } else {
              activeClass = "bg-[#FFD23F] text-[#14283F] border-2 border-[#E6B800] shadow-accent-glow font-extrabold";
            }
          }

          return (
            <button
              key={opt.val}
              type="button"
              onClick={() => handleAnswerChange(field, opt.val)}
              className={`btn-pill text-xs py-2 px-3 border transition-all ${activeClass}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Flip7 Staged Progress Header */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8F6F5] shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#FFD23F] text-[#14283F] font-extrabold text-sm flex items-center justify-center shadow-accent-glow">
              {step}
            </span>
            <div>
              <span className="text-[11px] font-extrabold text-[#1E8C86] uppercase tracking-wider">
                {t.common.step} {step} {t.common.of} 4
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#14283F]">
                {step === 1 && t.safetyGate.title}
                {step === 2 && t.assessment.card1Title}
                {step === 3 && t.assessment.card2Title}
                {step === 4 && t.assessment.card4Title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === i
                    ? "bg-[#FFD23F] ring-4 ring-[#FFE47A]"
                    : step > i
                    ? "bg-[#2BA8A2]"
                    : "bg-[#E8F6F5]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: CRITICAL SAFETY GATE */}
        {step === 1 && (
          <div className="flip7-card flip7-card-coral p-6 sm:p-8 space-y-6">
            <div className="bg-[#FFF3F0] border-2 border-[#FF8A6A] p-4 rounded-2xl text-xs text-[#14283F] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#EF6C4A] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#EF6C4A]">Acute Symptom Priority Gate:</strong> Sudden severe testicular pain or pain with nausea requires immediate hospital emergency room evaluation. Any affirmative response halts routine intake immediately.
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.safetyGate.suddenPainLabel}
              </label>
              <p className="text-xs text-slate-text">
                {t.safetyGate.suddenPainHelp}
              </p>
              {renderPillChoices("suddenSevereTesticularPain", true)}
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.safetyGate.painNauseaLabel}
              </label>
              <p className="text-xs text-slate-text">
                {t.safetyGate.painNauseaHelp}
              </p>
              {renderPillChoices("painWithNauseaOrVomiting", true)}
            </div>
          </div>
        )}

        {/* STEP 2: CONTEXT & INTENT */}
        {step === 2 && (
          <div className="flip7-card p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.ageBandLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { id: "18_24", label: "18–24 years" },
                  { id: "25_34", label: "25–34 years" },
                  { id: "35_44", label: "35–44 years" },
                  { id: "45_54", label: "45–54 years" },
                  { id: "55_plus", label: "55+ years" },
                  { id: "undisclosed", label: "Prefer not to say" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAnswerChange("ageBand", item.id)}
                    className={`btn-pill text-xs py-2 px-3 border transition-all ${
                      answers.ageBand === item.id
                        ? "bg-[#2BA8A2] text-white border-[#2BA8A2] shadow-teal-glow"
                        : "bg-white text-slate-text border-[#E8F6F5] hover:border-[#2BA8A2]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.goalLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
                    className={`btn-pill text-xs py-2.5 px-4 text-left justify-start border transition-all ${
                      answers.primaryGoal === item.id
                        ? "bg-[#2BA8A2] text-white border-[#2BA8A2] shadow-teal-glow"
                        : "bg-white text-slate-text border-[#E8F6F5] hover:border-[#2BA8A2]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.difficultyConceivingLabel}
              </label>
              {renderPillChoices("difficultyConceiving")}
            </div>
          </div>
        )}

        {/* STEP 3: UROLOGICAL & LIFESTYLE HISTORY */}
        {step === 3 && (
          <div className="flip7-card flip7-card-gold p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.lumpLabel}
              </label>
              {renderPillChoices("newLumpOrSwelling")}
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.surgeryLabel}
              </label>
              {renderPillChoices("priorTesticularSurgeryOrInjury")}
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.tobaccoLabel}
              </label>
              {renderPillChoices("tobaccoUse")}
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8F6F5]">
              <label className="block text-sm font-extrabold text-[#14283F]">
                {t.assessment.heatLabel}
              </label>
              {renderPillChoices("occupationalHeatExposure")}
            </div>
          </div>
        )}

        {/* STEP 4: SYNTHETIC LAB REPORT */}
        {step === 4 && assessmentId && (
          <div className="flip7-card flip7-card-sky p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="font-extrabold text-[#14283F] text-xl">
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
          <div className="p-4 bg-[#FFF3F0] border-2 border-[#FF8A6A] rounded-2xl text-xs font-bold text-[#EF6C4A]">
            {errorMsg}
          </div>
        )}

        {/* Navigation Buttons - Flip7 Pill Style */}
        <div className="flex items-center justify-between pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn-pill bg-white border-2 border-[#1E8C86]/40 text-[#14283F] hover:bg-[#E8F6F5] text-xs"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn-pill btn-teal-primary text-xs"
            >
              <span>{t.common.continue}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isSubmitting}
              className="btn-pill btn-gold-cta text-xs font-extrabold"
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
