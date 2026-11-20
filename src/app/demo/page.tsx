"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { DEMO_PRESETS, DemoScenario } from "@/lib/fixtures/cases";
import { Activity, Play, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-teal uppercase tracking-wider">
            Evaluation Benchmarks
          </span>
          <h1 className="text-3xl font-extrabold text-navy">
            Judge & Reviewer Scenarios
          </h1>
          <p className="text-sm text-slate-text max-w-xl mx-auto">
            Select any predefined fictional case to instantly evaluate VitaSignal AI's clinical routing, safety gates, and consent controls without manual data entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DEMO_PRESETS.map((scenario) => {
            const isUrgent = scenario.expectedPathway === "urgent";
            const isLoading = loadingScenarioId === scenario.id;

            return (
              <div
                key={scenario.id}
                className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  isUrgent
                    ? "border-urgent-border bg-red-50/20"
                    : "border-navy-100"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-navy-50 text-navy rounded border border-navy-100">
                      Scenario {scenario.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        isUrgent
                          ? "bg-red-100 text-red-700"
                          : "bg-teal-50 text-teal-700 border border-teal-200"
                      }`}
                    >
                      {scenario.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-navy text-lg">
                    {locale === "ar" ? scenario.nameAr : scenario.name}
                  </h3>

                  <p className="text-xs text-slate-text leading-relaxed">
                    {locale === "ar" ? scenario.descriptionAr : scenario.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-text bg-navy-50/80 p-2.5 rounded-lg border border-navy-100">
                    <div>
                      <strong>Expected Pathway:</strong>{" "}
                      <span className="text-teal font-semibold">
                        {scenario.expectedPathway}
                      </span>
                    </div>
                    <div>
                      <strong>Primary Rule ID:</strong>{" "}
                      <span className="text-navy">{scenario.expectedRuleId}</span>
                    </div>
                    {scenario.reportFixtureId && (
                      <div>
                        <strong>Curated Fixture:</strong>{" "}
                        <span className="text-navy">{scenario.reportFixtureId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleLaunchPreset(scenario)}
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isUrgent
                        ? "bg-urgent text-white hover:bg-red-700"
                        : "bg-navy text-white hover:bg-navy-900"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isLoading ? "Loading Preset..." : "Launch This Scenario"}</span>
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
