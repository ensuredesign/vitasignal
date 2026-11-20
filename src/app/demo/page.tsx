"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { DEMO_PRESETS, DemoScenario } from "@/lib/fixtures/cases";
import { Play, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";

function DemoPresetsContent() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [loadingScenarioId, setLoadingScenarioId] = useState<string | null>(null);

  const handleLaunchPreset = async (scenario: DemoScenario) => {
    setLoadingScenarioId(scenario.id);
    try {
      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id,
          locale,
          syntheticConsent: true,
          adultScenario: true,
          aiConsent: true,
        }),
      });

      if (res.ok) {
        router.push("/assessment");
      }
    } catch {
      router.push("/assessment");
    } finally {
      setLoadingScenarioId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E7] border border-[#F4ECD4] text-[#1E8C86] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD23F] fill-current" />
            <span>Judge & Reviewer Scenarios</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14283F]">
            Predefined Fictional Cases
          </h1>
          <p className="text-sm text-slate-text max-w-xl mx-auto">
            Click any scenario card to immediately test clinical pathway determinism, urgent gates, and evidence links without manual questionnaire typing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_PRESETS.map((scenario) => {
            const isUrgent = scenario.expectedPathway === "urgent";
            const isFertility = scenario.expectedPathway === "fertility_services";
            const isUrology = scenario.expectedPathway === "urology_andrology";
            const isLoading = loadingScenarioId === scenario.id;

            // Determine Flip7 accent border
            let cardAccentClass = "border-l-[#2BA8A2]";
            if (isUrgent) cardAccentClass = "border-l-[#EF6C4A] shadow-coral-glow";
            else if (isFertility) cardAccentClass = "border-l-[#FFD23F] shadow-accent-glow";
            else if (isUrology) cardAccentClass = "border-l-[#5DADE2] shadow-sky-glow";

            return (
              <div
                key={scenario.id}
                className={`bg-white rounded-3xl p-6 border border-[#E8F6F5] border-l-[8px] ${cardAccentClass} shadow-card flex flex-col justify-between transition-all hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-xs font-mono font-extrabold bg-[#FFF8E7] text-[#14283F] rounded-full border border-[#F4ECD4]">
                      Scenario {scenario.id}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                        isUrgent
                          ? "bg-[#FFF3F0] text-[#EF6C4A] border border-[#FF8A6A]"
                          : isFertility
                          ? "bg-[#FFF8E7] text-[#14283F] border border-[#FFD23F]"
                          : "bg-[#E8F6F5] text-[#1E8C86] border border-[#C7F1F3]"
                      }`}
                    >
                      {scenario.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#14283F] text-xl">
                    {locale === "ar" ? scenario.nameAr : scenario.name}
                  </h3>

                  <p className="text-xs text-slate-text leading-relaxed">
                    {locale === "ar" ? scenario.descriptionAr : scenario.description}
                  </p>

                  <div className="text-xs font-mono text-[#14283F] bg-[#EFF8F7] p-3 rounded-2xl border border-[#C7F1F3]/50 space-y-1">
                    <div>
                      <strong>Expected Pathway:</strong>{" "}
                      <span className="text-[#2BA8A2] font-bold">
                        {scenario.expectedPathway}
                      </span>
                    </div>
                    <div>
                      <strong>Primary Rule ID:</strong>{" "}
                      <span className="font-bold">{scenario.expectedRuleId}</span>
                    </div>
                    {scenario.reportFixtureId && (
                      <div>
                        <strong>Report Fixture:</strong>{" "}
                        <span className="text-[#E6B800] font-bold">{scenario.reportFixtureId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleLaunchPreset(scenario)}
                    disabled={isLoading}
                    className={`btn-pill w-full text-xs font-extrabold ${
                      isUrgent
                        ? "btn-coral-urgent"
                        : isFertility
                        ? "btn-gold-cta"
                        : "btn-teal-primary"
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isLoading ? "Launching..." : "Launch This Scenario"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DemoPage() {
  return (
    <LocaleProvider>
      <DemoPresetsContent />
    </LocaleProvider>
  );
}
