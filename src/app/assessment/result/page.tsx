"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EvidenceDrawer } from "@/components/evidence/EvidenceDrawer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { AssessmentResult, Pathway } from "@/lib/clinical/types";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Info,
  Lock,
  RefreshCw,
  PhoneCall,
  Activity,
} from "lucide-react";

function ResultContent() {
  const { t, locale } = useLocale();
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

        // Evaluate latest state
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
      <div className="min-h-screen flex flex-col bg-offwhite">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-teal animate-spin mx-auto" />
            <p className="text-sm font-medium text-navy">Evaluating clinical pathway signals...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMsg || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-offwhite">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto p-6 flex flex-col justify-center text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-urgent mx-auto" />
          <h2 className="text-xl font-bold text-navy">Assessment Unavailable</h2>
          <p className="text-xs text-slate-text">{errorMsg || "Please start a case first."}</p>
          <Link
            href="/demo"
            className="px-6 py-2.5 bg-teal text-white text-xs font-bold rounded-lg inline-block mx-auto"
          >
            Go to Demo Scenarios
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isUrgent = result.pathway === "urgent";
  const pathwayInfo = t.pathway[result.pathway] || t.pathway.education;

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* EMERGENCY OVERRIDE BANNER */}
        {isUrgent ? (
          <div className="bg-red-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-white flex-shrink-0 animate-bounce" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-red-200">
                  {pathwayInfo.badge}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold">
                  {pathwayInfo.title}
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-red-100">
              {pathwayInfo.summary}
            </p>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-sm text-white">Emergency Action Checklist:</h4>
              <ul className="text-xs space-y-1.5 list-disc list-inside text-red-100">
                {pathwayInfo.nextSteps?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs bg-black/20 p-3 rounded-lg border border-white/10 text-red-200">
              <strong>Clinical Safety Policy:</strong> Routine sharing, AI report extraction, and simulated referrals are strictly disabled during acute presentations to prevent delay of emergency surgical care.
            </div>
          </div>
        ) : (
          /* ROUTINE / PREVENTIVE PATHWAY CARD */
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-navy-100 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-50 pb-4">
              <div>
                <span className="text-xs font-bold text-teal uppercase tracking-wider">
                  Proposed Care Pathway
                </span>
                <h1 className="text-2xl font-extrabold text-navy mt-1">
                  {pathwayInfo.title}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                  {pathwayInfo.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-text bg-navy-50 px-2 py-1 rounded">
                  v{result.ruleVersion}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-text leading-relaxed">
              {pathwayInfo.summary}
            </p>

            {/* Proposed Next Steps */}
            <div className="bg-navy-50/70 border border-navy-100 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-navy">
                Suggested Actions:
              </h4>
              <ul className="text-xs text-slate-text space-y-1.5 list-disc list-inside">
                {pathwayInfo.nextSteps?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            {/* Alternative Routes if any */}
            {result.alternatives.length > 0 && (
              <div className="text-xs text-slate-text bg-teal-50/50 border border-teal-100 p-3 rounded-lg">
                <strong>Secondary Considerations:</strong> In addition to specialist review, this profile also identifies relevance for:{" "}
                {result.alternatives.map((alt) => (
                  <span key={alt} className="font-semibold text-teal-800 capitalize mr-2">
                    • {alt.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OBSERVED FINDINGS & EVIDENCE TRACEABILITY */}
        <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal" />
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
                className="p-4 rounded-xl border border-navy-100 bg-navy-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal bg-white px-2 py-0.5 rounded border border-navy-100">
                      Rule {f.ruleId}
                    </span>
                    <span className="font-semibold text-navy capitalize">
                      {f.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-text bg-navy-100 px-1.5 py-0.2 rounded font-mono">
                      {f.origin}
                    </span>
                  </div>
                  <div className="text-slate-text font-medium">
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
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-amber-600" />
              <span>{t.common.unknowns} ({result.missing.length} unconfirmed / skipped items)</span>
            </div>
            <p className="leading-relaxed">
              In accordance with clinical safety principles, skipped or unknown questions are never treated as negative evidence.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.missing.map((key) => (
                <span key={key} className="px-2 py-0.5 rounded bg-white border border-amber-300 font-mono text-[11px]">
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM ACTION CTA */}
        {!isUrgent && (
          <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-lg flex items-center gap-2 justify-center sm:justify-start">
                <Lock className="w-5 h-5 text-teal" />
                <span>Next Step: PrivacyVault Granular Handoff</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-md">
                Select only the specific findings you wish to share with a simulated care coordinator. Default none selected.
              </p>
            </div>

            <Link
              href="/care"
              className="px-6 py-3 bg-teal text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition flex items-center gap-2 shadow-sm flex-shrink-0"
            >
              <span>Configure Granular Share</span>
              <ArrowRight className="w-4 h-4" />
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
