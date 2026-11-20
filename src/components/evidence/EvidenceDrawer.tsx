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
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-md transition ${className}`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>{triggerButtonText}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal" />
                <h3 className="font-bold text-navy text-lg">Clinical Evidence Drawer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-text hover:bg-navy-50"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Tab Selector */}
            <div className="flex flex-wrap gap-1.5 my-4">
              {Object.values(EVIDENCE_REGISTRY).map((src) => (
                <button
                  key={src.id}
                  onClick={() => setSelectedSource(src)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    selectedSource.id === src.id
                      ? "bg-teal text-white border-teal shadow-sm"
                      : "bg-navy-50 text-slate-text border-navy-100 hover:bg-navy-100"
                  }`}
                >
                  [{src.id}] {src.publisher.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Selected Source Details */}
            <div className="space-y-4 flex-1">
              <div className="bg-navy-50 border border-navy-100 rounded-xl p-4">
                <span className="text-xs font-bold text-teal tracking-wide uppercase">
                  Source Reference {selectedSource.id}
                </span>
                <h4 className="font-bold text-navy text-base mt-1">
                  {selectedSource.title}
                </h4>
                <div className="text-xs text-slate-text mt-1">
                  Published by <strong>{selectedSource.publisher}</strong> ({selectedSource.year})
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Clinical Paraphrase & Guideline Scope
                </h5>
                <p className="text-sm text-slate-text leading-relaxed bg-white border border-navy-100 rounded-lg p-3">
                  {selectedSource.summary}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Applicable Decision Rules
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedSource.applicableRules.map((rule) => (
                    <span
                      key={rule}
                      className="px-2 py-0.5 text-xs font-mono font-semibold bg-teal-50 border border-teal-200 text-teal-700 rounded"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Regulatory & Prototype Boundary:</strong> This citation demonstrates evidence-grounding for prototype logic. VitaSignal AI is an investigational decision-support research demo and has not undergone formal clinical or regulatory certification.
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
                >
                  <span>Open Official Guideline Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-navy-100 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-900 transition"
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
