"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  Activity,
  ShieldCheck,
  FileSearch,
  Lock,
  ArrowRight,
  AlertTriangle,
  HeartPulse,
  Scale,
  Sparkles,
} from "lucide-react";

function LandingContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [adultConsent, setAdultConsent] = useState(false);
  const [processingConsent, setProcessingConsent] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartCase = async () => {
    if (!adultConsent || !processingConsent) return;
    setIsStarting(true);
    try {
      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: "D01",
          locale: "en",
          syntheticConsent: true,
          adultScenario: true,
          aiConsent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/assessment");
      }
    } catch {
      // Fallback redirect
      router.push("/assessment");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white to-offwhite border-b border-navy-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.landing.challengeBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight leading-tight">
              {t.landing.heroTitle}
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-text leading-relaxed">
              {t.landing.heroSubtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowConsentModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-teal text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition flex items-center justify-center gap-2 group"
              >
                <span>{t.landing.ctaStart}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/demo"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-navy font-bold rounded-xl border border-navy-200 hover:bg-navy-50 transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t.landing.ctaPresets}</span>
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-text font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal" />
                Pure Deterministic Rules
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal" />
                24-Hour Ephemeral Sessions
              </span>
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-teal" />
                Bilingual (English / العربية)
              </span>
            </div>
          </div>
        </section>

        {/* 3 Pillars Section */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-navy">
              Signal → Evidence → Action → Closure
            </h2>
            <p className="text-sm text-slate-text mt-2">
              How VitaSignal AI bridges early reproductive risk signals to safe care without diagnostic overreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-lg">{t.landing.pillar1Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar1Desc}
              </p>
              <div className="text-[11px] font-semibold text-teal pt-2">
                Priority Safety Gate + 6 PRD Decision Rules →
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-lg">{t.landing.pillar2Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar2Desc}
              </p>
              <div className="text-[11px] font-semibold text-teal pt-2">
                Verbatim Substring Validation + Gemini →
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-navy text-lg">{t.landing.pillar3Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar3Desc}
              </p>
              <div className="text-[11px] font-semibold text-teal pt-2">
                Granular Sharing + Coordinator Timeline →
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Triage Callout */}
        <section className="bg-urgent-bg border-y border-urgent-border py-6 px-4">
          <div className="max-w-4xl mx-auto flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-urgent flex-shrink-0" />
            <div className="text-xs sm:text-sm text-red-900 leading-snug">
              <strong>Emergency Override Guarantee:</strong> If acute testicular symptoms (sudden severe pain or pain with nausea) are reported, the routine intake and all AI extraction are halted immediately. An emergency evaluation protocol is displayed with zero delays.
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Adult Fictional Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-navy-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 pb-3 border-b border-navy-100">
              <ShieldCheck className="w-6 h-6 text-teal" />
              <h3 className="font-bold text-navy text-lg">{t.consent.title}</h3>
            </div>

            <p className="text-xs text-slate-text leading-relaxed">
              {t.consent.subtitle}
            </p>

            <div className="space-y-3 bg-navy-50/70 p-4 rounded-xl border border-navy-100 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adultConsent}
                  onChange={(e) => setAdultConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-teal focus:ring-teal"
                />
                <span className="font-medium text-navy">
                  {t.consent.adultCheck}
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processingConsent}
                  onChange={(e) => setProcessingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-teal focus:ring-teal"
                />
                <span className="font-medium text-navy">
                  {t.consent.processingCheck}
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-navy-100">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-teal focus:ring-teal"
                />
                <span className="text-slate-text">
                  {t.consent.aiCheck}
                </span>
              </label>
            </div>

            <div className="text-[11px] text-urgent font-medium">
              {t.consent.consentWarning}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-text hover:text-navy transition"
              >
                {t.common.cancel}
              </button>

              <button
                type="button"
                onClick={handleStartCase}
                disabled={!adultConsent || !processingConsent || isStarting}
                className="px-6 py-2.5 bg-teal text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
              >
                {isStarting ? "Initializing..." : t.consent.startBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <LocaleProvider>
      <LandingContent />
    </LocaleProvider>
  );
}
