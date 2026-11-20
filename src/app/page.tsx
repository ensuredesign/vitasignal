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
  CheckCircle,
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

      if (res.ok) {
        router.push("/assessment");
      }
    } catch {
      router.push("/assessment");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1">
        {/* Flip7 Inspired Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white via-[#EFF8F7] to-[#EFF8F7] border-b border-[#E8F6F5]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Retro Ribbon Style Challenge Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF8E7] border-2 border-[#14283F] text-[#14283F] text-xs font-extrabold uppercase tracking-wider shadow-sm transform -rotate-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD23F] fill-current" />
              <span>{t.landing.challengeBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#14283F] tracking-tight leading-tight">
              {t.landing.heroTitle}
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-text leading-relaxed">
              {t.landing.heroSubtitle}
            </p>

            {/* Flip7 Tactile Pill Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowConsentModal(true)}
                className="btn-pill btn-gold-cta w-full sm:w-auto text-base font-extrabold"
              >
                <span>{t.landing.ctaStart}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <Link
                href="/demo"
                className="btn-pill bg-white text-[#14283F] border-2 border-[#1E8C86] hover:bg-[#E8F6F5] shadow-card w-full sm:w-auto text-base"
              >
                <span>{t.landing.ctaPresets}</span>
              </Link>
            </div>

            {/* Quick Guarantees Chips */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#1E8C86]">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-[#C7F1F3] shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-[#2BA8A2]" />
                Pure Deterministic Rules
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-[#C7F1F3] shadow-xs">
                <Lock className="w-3.5 h-3.5 text-[#2BA8A2]" />
                24h Ephemeral Sessions
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-[#C7F1F3] shadow-xs">
                <Scale className="w-3.5 h-3.5 text-[#2BA8A2]" />
                Bilingual (English / العربية)
              </span>
            </div>
          </div>
        </section>

        {/* 3 Pillars Section - Flip7 Card System with Colored Left Accent */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
              Clinical Explainability Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-[#14283F] mt-1">
              Signal → Evidence → Action → Closure
            </h2>
            <p className="text-sm text-slate-text mt-2">
              Every finding is traceable to peer-reviewed guidelines. No AI hallucinated pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: SignalSense (Teal Accent) */}
            <div className="flip7-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F6F5] border border-[#C7F1F3] flex items-center justify-center text-[#2BA8A2] shadow-sm">
                <HeartPulse className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-[#14283F] text-xl">{t.landing.pillar1Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar1Desc}
              </p>
              <div className="pt-2 text-xs font-extrabold text-[#2BA8A2] flex items-center gap-1">
                <span>Priority Safety Gate + 6 Rules</span>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 2: EvidenceLens (Gold Accent) */}
            <div className="flip7-card flip7-card-gold p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] border border-[#F4ECD4] flex items-center justify-center text-[#E6B800] shadow-sm">
                <FileSearch className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-[#14283F] text-xl">{t.landing.pillar2Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar2Desc}
              </p>
              <div className="pt-2 text-xs font-extrabold text-[#E6B800] flex items-center gap-1">
                <span>Verbatim Substring Validation</span>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 3: PrivacyVault (Sky Blue Accent) */}
            <div className="flip7-card flip7-card-sky p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF8FF] border border-[#D1E9FF] flex items-center justify-center text-[#5DADE2] shadow-sm">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-[#14283F] text-xl">{t.landing.pillar3Title}</h3>
              <p className="text-xs text-slate-text leading-relaxed">
                {t.landing.pillar3Desc}
              </p>
              <div className="pt-2 text-xs font-extrabold text-[#5DADE2] flex items-center gap-1">
                <span>Granular Sharing + CareLoop</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Triage Callout in Flip7 Coral */}
        <section className="bg-[#FFF3F0] border-y-2 border-[#FF8A6A] py-8 px-4">
          <div className="max-w-4xl mx-auto flex items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#EF6C4A] shadow-coral-glow flex items-center justify-center text-white flex-shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="text-xs sm:text-sm text-[#14283F] leading-relaxed">
              <strong className="text-[#EF6C4A] font-extrabold">Emergency Override Protocol:</strong> If acute testicular symptoms (sudden severe pain or pain with nausea) are reported in the fictional assessment, the routine flow and AI extraction are immediately halted. An urgent surgical evaluation protocol is shown instantly.
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Adult Fictional Consent Modal (Flip7 Cream Surface) */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border-2 border-[#1E8C86]/20 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8F6F5]">
              <div className="w-9 h-9 rounded-xl bg-[#2BA8A2] text-white flex items-center justify-center shadow-teal-glow">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-[#14283F] text-lg">{t.consent.title}</h3>
            </div>

            <p className="text-xs text-slate-text leading-relaxed">
              {t.consent.subtitle}
            </p>

            <div className="space-y-3 bg-[#FFF8E7] p-4 rounded-2xl border border-[#F4ECD4] text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adultConsent}
                  onChange={(e) => setAdultConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                />
                <span className="font-bold text-[#14283F]">
                  {t.consent.adultCheck}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processingConsent}
                  onChange={(e) => setProcessingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                />
                <span className="font-bold text-[#14283F]">
                  {t.consent.processingCheck}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#F4ECD4]">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                />
                <span className="text-slate-text">
                  {t.consent.aiCheck}
                </span>
              </label>
            </div>

            <div className="text-[11px] text-[#EF6C4A] font-bold">
              {t.consent.consentWarning}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="btn-pill bg-[#EFF8F7] text-[#14283F] hover:bg-[#E8F6F5] text-xs py-2 px-4"
              >
                {t.common.cancel}
              </button>

              <button
                type="button"
                onClick={handleStartCase}
                disabled={!adultConsent || !processingConsent || isStarting}
                className="btn-pill btn-gold-cta text-xs py-2.5 px-6 disabled:opacity-50"
              >
                {isStarting ? "Starting..." : t.consent.startBtn}
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
