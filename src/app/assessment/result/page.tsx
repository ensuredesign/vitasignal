"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EvidenceDrawer } from "@/components/evidence/EvidenceDrawer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { AssessmentResult } from "@/lib/clinical/types";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  Lock,
  RefreshCw,
} from "lucide-react";

function ResultContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch("/api/assessment");
        if (!res.ok) throw new Error("No active assessment found");
        const data = await res.json();
        const assessment = data.assessment;

        const evalRes = await fetch("/api/assessment/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId: assessment.id,
            expectedRevision: assessment.revision,
          }),
        });
        const evalData = await evalRes.json();
        if (evalRes.ok) {
          setResult(evalData.result);
        } else {
          throw new Error(evalData.error?.message || "Evaluation failed");
        }
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResult();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-base">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#2BA8A2] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#14283F]">Computing deterministic care pathway...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-base">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto p-6 flex flex-col justify-center text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#EF6C4A] mx-auto" />
          <h2 className="text-2xl font-extrabold text-[#14283F]">Assessment Unavailable</h2>
          <p className="text-xs text-slate-text">{errorMsg || "Please start a case first."}</p>
          <Link href="/demo" className="btn-pill btn-teal-primary text-xs mx-auto">
            Go to Demo Scenarios
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isUrgent = result.pathway === "urgent";
  const pathwayInfo = t.pathway[result.pathway] || t.pathway.education;

  // Determine Flip7 accent border
  let cardBorder = "border-l-[#2BA8A2]";
  if (isUrgent) cardBorder = "border-l-[#EF6C4A]";
  else if (result.pathway === "fertility_services") cardBorder = "border-l-[#FFD23F]";
  else if (result.pathway === "urology_andrology") cardBorder = "border-l-[#5DADE2]";

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* EMERGENCY OVERRIDE BANNER IN CORAL */}
        {isUrgent ? (
          <div className="bg-[#FFF3F0] rounded-3xl p-6 sm:p-8 border-4 border-[#EF6C4A] shadow-coral-glow space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EF6C4A] flex items-center justify-center text-white flex-shrink-0 animate-bounce">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#EF6C4A]">
                  {pathwayInfo.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14283F]">
                  {pathwayInfo.title}
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-[#14283F]">
              {pathwayInfo.summary}
            </p>

            <div className="bg-white border-2 border-[#FF8A6A] rounded-2xl p-5 space-y-3">
              <h4 className="font-extrabold text-sm text-[#EF6C4A]">Emergency Action Checklist:</h4>
              <ul className="text-xs space-y-2 list-disc list-inside text-[#14283F]">
                {pathwayInfo.nextSteps?.map((step, idx) => (
                  <li key={idx} className="font-medium">{step}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs bg-white p-3 rounded-xl border border-[#FF8A6A] text-[#EF6C4A] font-bold">
              Emergency Safety Policy: Routine sharing and simulated referral workflows are strictly bypassed to ensure zero delay in emergency medical evaluation.
            </div>
          </div>
        ) : (
          /* ROUTINE / PREVENTIVE PATHWAY CARD */
          <div className={`flip7-card ${cardBorder} p-6 sm:p-8 space-y-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F6F5] pb-4">
              <div>
                <span className="text-xs font-extrabold text-[#1E8C86] uppercase tracking-wider">
                  Proposed Care Pathway
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14283F] mt-1">
                  {pathwayInfo.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-[#E8F6F5] text-[#1E8C86] text-xs font-extrabold rounded-full border border-[#C7F1F3]">
                  {pathwayInfo.badge}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-text bg-[#FFF8E7] px-2.5 py-1 rounded-full border border-[#F4ECD4]">
                  v{result.ruleVersion}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-text leading-relaxed">
              {pathwayInfo.summary}
            </p>

            {/* Proposed Next Steps */}
            <div className="bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl p-5 space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#14283F]">
                Suggested Clinical Discussions:
              </h4>
              <ul className="text-xs text-slate-text space-y-1.5 list-disc list-inside">
                {pathwayInfo.nextSteps?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Alternative Routes if any */}
            {result.alternatives.length > 0 && (
              <div className="text-xs text-slate-text bg-[#EFF8F7] border border-[#C7F1F3] p-3.5 rounded-2xl">
                <strong>Secondary Considerations:</strong> In addition to specialist review, this profile also identifies relevance for:{" "}
                {result.alternatives.map((alt) => (
                  <span key={alt} className="font-bold text-[#1E8C86] capitalize mr-2">
                    • {alt.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OBSERVED FINDINGS & EVIDENCE TRACEABILITY */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8F6F5] shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#14283F] text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2BA8A2]" />
              <span>{t.common.findings} ({result.findings.length})</span>
            </h3>
            <span className="text-xs text-slate-text">
              Each finding is linked to authoritative clinical guidelines
            </span>
          </div>

          <div className="space-y-3">
            {result.findings.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border-2 border-[#E8F6F5] bg-[#EFF8F7]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#1E8C86] bg-white px-2.5 py-0.5 rounded-full border border-[#C7F1F3]">
                      Rule {f.ruleId}
                    </span>
                    <span className="font-bold text-[#14283F] capitalize">
                      {f.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-text bg-[#FFF8E7] px-2 py-0.5 rounded-full font-mono border border-[#F4ECD4]">
                      {f.origin}
                    </span>
                  </div>
                  <div className="text-slate-text font-medium pt-1">
                    {f.observed}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {f.sourceIds.map((srcId) => (
                    <EvidenceDrawer
                      key={srcId}
                      sourceId={srcId}
                      triggerButtonText={`Evidence [${srcId}]`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UNRESOLVED / MISSING DATA DISCLOSURE */}
        {result.missing.length > 0 && (
          <div className="bg-[#FFF8E7] border border-[#F4ECD4] rounded-3xl p-6 text-xs text-[#14283F] space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <Info className="w-4 h-4 text-[#D97706]" />
              <span>{t.common.unknowns} ({result.missing.length} unconfirmed or skipped questions)</span>
            </div>
            <p className="leading-relaxed text-slate-text">
              Skipped questions are strictly preserved as unknown and never assumed negative.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.missing.map((key) => (
                <span key={key} className="px-3 py-1 rounded-full bg-white border border-[#F4ECD4] font-mono text-[11px] font-bold text-[#14283F]">
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CTA IN FLIP7 GOLD */}
        {!isUrgent && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFD23F] shadow-accent-glow flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-extrabold text-xl text-[#14283F] flex items-center gap-2 justify-center sm:justify-start">
                <Lock className="w-5 h-5 text-[#2BA8A2]" />
                <span>PrivacyVault Granular Sharing</span>
              </h3>
              <p className="text-xs text-slate-text max-w-md">
                Select only the specific findings you authorize transmitting to a simulated care coordinator. Default none selected.
              </p>
            </div>

            <Link
              href="/care"
              className="btn-pill btn-gold-cta text-xs font-extrabold flex-shrink-0"
            >
              <span>Configure Granular Share</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ResultPage() {
  return (
    <LocaleProvider>
      <ResultContent />
    </LocaleProvider>
  );
}
