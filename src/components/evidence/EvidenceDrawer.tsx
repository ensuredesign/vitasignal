"use client";

import React, { useState } from "react";
import { EVIDENCE_REGISTRY, EvidenceSource } from "@/lib/evidence/registry";
import { BookOpen, ExternalLink, X, ShieldAlert } from "lucide-react";

interface EvidenceDrawerProps {
  sourceId?: string;
  triggerButtonText?: string;
  className?: string;
}

export function EvidenceDrawer({
  sourceId,
  triggerButtonText = "View Evidence Citation",
  className = "",
}: EvidenceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<EvidenceSource>(
    sourceId && EVIDENCE_REGISTRY[sourceId]
      ? EVIDENCE_REGISTRY[sourceId]
      : EVIDENCE_REGISTRY["C1"]
  );

  const handleOpen = (id?: string) => {
    if (id && EVIDENCE_REGISTRY[id]) {
      setSelectedSource(EVIDENCE_REGISTRY[id]);
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={() => handleOpen(sourceId)}
        type="button"
        className={`btn-pill text-xs py-1.5 px-3 bg-[#E8F6F5] hover:bg-[#C7F1F3] text-[#1E8C86] border border-[#2BA8A2]/30 active:scale-95 transition-all shadow-xs ${className}`}
      >
        <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{triggerButtonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8F6F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2BA8A2] text-white flex items-center justify-center shadow-teal-glow">
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-[#14283F] text-lg">Clinical Evidence Drawer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-text hover:bg-[#E8F6F5]"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Pill Selector */}
            <div className="flex flex-wrap gap-2 my-4">
              {Object.values(EVIDENCE_REGISTRY).map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  className={`btn-pill text-xs py-1 px-3 border transition-all ${
                    selectedSource.id === src.id
                      ? "btn-teal-primary text-white font-extrabold"
                      : "bg-[#FFF8E7] text-[#14283F] border-[#F4ECD4] hover:bg-[#F4ECD4]"
                  }`}
                >
                  [{src.id}] {src.publisher.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Selected Source Details */}
            <div className="space-y-4 flex-1">
              <div className="bg-[#EFF8F7] border border-[#C7F1F3] rounded-2xl p-4">
                <span className="text-xs font-extrabold text-[#2BA8A2] tracking-wide uppercase">
                  Source Reference {selectedSource.id}
                </span>
                <h4 className="font-extrabold text-[#14283F] text-base mt-1">
                  {selectedSource.title}
                </h4>
                <div className="text-xs text-slate-text mt-1">
                  Published by <strong>{selectedSource.publisher}</strong> ({selectedSource.year})
                </div>
              </div>

              <div>
                <h5 className="text-xs font-extrabold text-[#14283F] uppercase tracking-wider mb-1.5">
                  Clinical Paraphrase & Guideline Scope
                </h5>
                <p className="text-xs text-slate-text leading-relaxed bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl p-4">
                  {selectedSource.summary}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-extrabold text-[#14283F] uppercase tracking-wider mb-1.5">
                  Applicable Decision Rules
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedSource.applicableRules.map((rule) => (
                    <span
                      key={rule}
                      className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#E8F6F5] border border-[#2BA8A2]/30 text-[#1E8C86] rounded-full"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FFF8E7] border border-[#FFD23F] rounded-2xl p-4 text-xs text-[#14283F] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#E6B800] mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">
                  <strong>Regulatory Boundary:</strong> Demonstrates clinical evidence grounding for prototype logic. VitaSignal AI is a research demonstration prototype and has not undergone formal regulatory medical device certification.
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2BA8A2] hover:underline"
                >
                  <span>Open Official Guideline Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8F6F5] mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="btn-pill btn-teal-primary w-full text-xs"
              >
                Close Evidence Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
