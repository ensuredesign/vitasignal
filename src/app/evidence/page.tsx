"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import { EVIDENCE_REGISTRY } from "@/lib/evidence/registry";
import { RULES } from "@/lib/clinical/rules";
import { BookOpen, ExternalLink, Scale } from "lucide-react";

function EvidenceContent() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
            Clinical Traceability
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14283F] mt-1">
            {t.evidence.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.evidence.subtitle}
          </p>
        </div>

        {/* C1 - C5 Sources */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-[#14283F] text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#2BA8A2]" />
            <span>{t.evidence.registryHeading}</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {Object.values(EVIDENCE_REGISTRY).map((src) => (
              <div
                key={src.id}
                className="flip7-card p-6 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8F6F5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 text-xs font-mono font-extrabold bg-[#FFF8E7] text-[#14283F] rounded-full border border-[#F4ECD4]">
                      [{src.id}]
                    </span>
                    <span className="font-extrabold text-[#14283F] text-sm">
                      {src.publisher} ({src.year})
                    </span>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#2BA8A2] hover:underline"
                  >
                    <span>Official Guideline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <h4 className="font-extrabold text-[#14283F] text-base">
                  {src.title}
                </h4>

                <p className="text-xs text-slate-text leading-relaxed">
                  {src.summary}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-bold text-[#14283F]">Applicable Rules:</span>
                  {src.applicableRules.map((rule) => (
                    <span
                      key={rule}
                      className="px-2.5 py-0.5 rounded-full bg-[#E8F6F5] text-[#1E8C86] font-mono text-[11px] font-bold border border-[#C7F1F3]"
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
        <div className="flip7-card flip7-card-sky p-6 sm:p-8 space-y-4">
          <h3 className="font-extrabold text-[#14283F] text-xl flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#5DADE2]" />
            <span>{t.evidence.rulesHeading}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#E8F6F5] text-slate-text">
                  <th className="py-3 font-extrabold text-[#14283F]">Priority & ID</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Rule Name</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Category</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F6F5] text-[#14283F] font-medium">
                {Object.values(RULES).map((rule) => (
                  <tr key={rule.id}>
                    <td className="py-3 font-mono font-bold text-[#2BA8A2]">
                      P{rule.priority} • {rule.id}
                    </td>
                    <td className="py-3 text-[#14283F] font-bold">{rule.name}</td>
                    <td className="py-3 text-slate-text capitalize">
                      {rule.category.replace("_", " ")}
                    </td>
                    <td className="py-3 text-[#1E8C86] font-mono font-bold">
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
