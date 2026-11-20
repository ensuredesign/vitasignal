"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { EVIDENCE_REGISTRY } from "@/lib/evidence/registry";
import { RULES } from "@/lib/clinical/rules";
import { BookOpen, ExternalLink, ShieldCheck, Scale } from "lucide-react";

function EvidenceContent() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal uppercase tracking-wider">
            Clinical Traceability
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">
            {t.evidence.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.evidence.subtitle}
          </p>
        </div>

        {/* C1 - C5 Sources */}
        <div className="space-y-4">
          <h3 className="font-bold text-navy text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal" />
            <span>{t.evidence.registryHeading}</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {Object.values(EVIDENCE_REGISTRY).map((src) => (
              <div
                key={src.id}
                className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-teal-50 text-teal-800 rounded border border-teal-200">
                      [{src.id}]
                    </span>
                    <span className="font-bold text-navy text-sm">
                      {src.publisher} ({src.year})
                    </span>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                  >
                    <span>Official Guideline</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h4 className="font-bold text-navy text-base">
                  {src.title}
                </h4>

                <p className="text-xs text-slate-text leading-relaxed">
                  {src.summary}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-navy">Applicable Rules:</span>
                  {src.applicableRules.map((rule) => (
                    <span
                      key={rule}
                      className="px-2 py-0.5 rounded bg-navy-50 text-navy font-mono text-[11px] font-bold"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Rules Inventory */}
        <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
          <h3 className="font-bold text-navy text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal" />
            <span>{t.evidence.rulesHeading}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-100 text-slate-text">
                  <th className="py-2.5 font-bold">Priority / ID</th>
                  <th className="py-2.5 font-bold">Rule Name</th>
                  <th className="py-2.5 font-bold">Category</th>
                  <th className="py-2.5 font-bold">Source Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 text-navy font-medium">
                {Object.values(RULES).map((rule) => (
                  <tr key={rule.id}>
                    <td className="py-2.5 font-mono font-bold text-teal">
                      P{rule.priority} • {rule.id}
                    </td>
                    <td className="py-2.5 text-navy">{rule.name}</td>
                    <td className="py-2.5 text-slate-text capitalize">
                      {rule.category.replace("_", " ")}
                    </td>
                    <td className="py-2.5 text-teal font-mono">
                      {rule.sourceIds.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EvidencePage() {
  return (
    <LocaleProvider>
      <EvidenceContent />
    </LocaleProvider>
  );
}
