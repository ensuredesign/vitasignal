"use client";

import React, { useState } from "react";
import { SYNTHETIC_REPORTS, SyntheticReportFixture } from "@/lib/fixtures/reports";
import { useLocale } from "@/lib/i18n/context";
import { FileText, Cpu, CheckCircle2, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

interface ReportStepProps {
  assessmentId: string;
  revision: number;
  onConfirmed: (newRevision: number) => void;
}

export function ReportStep({ assessmentId, revision, onConfirmed }: ReportStepProps) {
  const { t } = useLocale();
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>("REP-01-OLIGO");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);
  const [confirmedCandidateIds, setConfirmedCandidateIds] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fixture: SyntheticReportFixture = SYNTHETIC_REPORTS[selectedFixtureId];

  const handleExtract = async (mode: "live_ai" | "fixture_replay") => {
    setIsExtracting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/report/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          expectedRevision: revision,
          fixtureId: selectedFixtureId,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Extraction failed");
      }

      setExtractionResult(data);
      const initialChecked = (data.observations || [])
        .map((o: any) => o.id)
        .filter(Boolean);
      setConfirmedCandidateIds(initialChecked);
    } catch (err: any) {
      setStatusMessage(`Extraction error: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleCandidate = (id: string) => {
    setConfirmedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirmObservations = async () => {
    if (!extractionResult) return;
    setIsConfirming(true);
    try {
      const res = await fetch("/api/report/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractionId: extractionResult.extractionId,
          assessmentId,
          acceptedCandidateIds: confirmedCandidateIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Confirmation failed");
      }

      setStatusMessage(`Successfully confirmed ${data.confirmedCount} observations (Session revision updated to ${data.newRevision})`);
      onConfirmed(data.newRevision);
    } catch (err: any) {
      setStatusMessage(`Confirmation error: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fixture Selection Buttons */}
      <div className="bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl p-5 shadow-xs">
        <label className="block text-xs font-extrabold text-[#14283F] uppercase tracking-wider mb-3">
          {t.assessment.selectFixtureLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(SYNTHETIC_REPORTS).map((rep) => (
            <button
              key={rep.id}
              type="button"
              onClick={() => {
                setSelectedFixtureId(rep.id);
                setExtractionResult(null);
                setStatusMessage(null);
              }}
              className={`p-3 text-left rounded-2xl border-2 text-xs transition-all active:scale-95 ${
                selectedFixtureId === rep.id
                  ? "border-[#2BA8A2] bg-white text-[#14283F] font-bold shadow-teal-glow"
                  : "border-[#E8F6F5] bg-white/70 text-slate-text hover:bg-white"
              }`}
            >
              <div className="font-extrabold text-[#14283F] flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#2BA8A2]" />
                {rep.id}
              </div>
              <div className="text-[11px] leading-tight text-slate-text line-clamp-2">
                {rep.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Synthetic Text Display in Crisp Box */}
      {fixture && (
        <div className="bg-white rounded-2xl p-4 border-2 border-[#1E8C86]/30 shadow-card text-[#14283F] font-mono text-xs relative overflow-x-auto">
          <div className="absolute top-3 right-3 text-[10px] bg-[#FFF3F0] text-[#EF6C4A] border border-[#FF8A6A] px-2 py-0.5 rounded-full font-sans uppercase font-extrabold tracking-wider">
            {fixture.marker}
          </div>
          <pre className="whitespace-pre-wrap">{fixture.sourceText}</pre>
        </div>
      )}

      {/* Extraction Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleExtract("live_ai")}
          disabled={isExtracting}
          className="btn-pill btn-gold-cta text-xs"
        >
          {isExtracting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Cpu className="w-4 h-4" />
          )}
          <span>{t.assessment.extractBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => handleExtract("fixture_replay")}
          disabled={isExtracting}
          className="btn-pill bg-white text-[#14283F] border-2 border-[#2BA8A2] hover:bg-[#E8F6F5] text-xs shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-[#2BA8A2]" />
          <span>{t.assessment.replayBtn}</span>
        </button>
      </div>

      {/* Extraction Results with Flip7 Pill Badges */}
      {extractionResult && (
        <div className="bg-[#EFF8F7] border-2 border-[#2BA8A2]/40 rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C7F1F3] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2BA8A2]" />
              <span className="text-xs font-extrabold text-[#14283F]">
                {t.assessment.modeNotice}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-extrabold rounded-full bg-[#2BA8A2] text-white">
                {extractionResult.mode}
              </span>
              <span className="text-xs text-slate-text">
                ({extractionResult.model} • {extractionResult.latencyMs}ms)
              </span>
            </div>
            <span className="text-xs font-bold text-[#1E8C86]">
              {extractionResult.observations?.length || 0} observations grounded
            </span>
          </div>

          {/* Observations Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-extrabold text-[#14283F] uppercase tracking-wider">
              {t.assessment.confirmCandidatesTitle}
            </h5>
            <p className="text-xs text-slate-text">
              {t.assessment.confirmCandidatesHelp}
            </p>

            <div className="space-y-2 pt-1">
              {extractionResult.observations?.map((obs: any, idx: number) => {
                const isChecked = confirmedCandidateIds.includes(obs.id);
                return (
                  <div
                    key={obs.id || idx}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                      isChecked
                        ? "bg-white border-[#2BA8A2] shadow-teal-glow"
                        : "bg-white/60 border-[#E8F6F5] opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`cand_${obs.id}`}
                      checked={isChecked}
                      onChange={() => toggleCandidate(obs.id)}
                      className="mt-1 h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                    />
                    <label htmlFor={`cand_${obs.id}`} className="flex-1 text-xs cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#14283F] capitalize">
                          {obs.field.replace("_", " ")}:
                        </span>
                        <span className="font-mono font-bold text-[#1E8C86]">
                          {obs.rawValue} {obs.unit || ""}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            obs.reportedFlag === "abnormal"
                              ? "bg-[#FFF3F0] text-[#EF6C4A] border border-[#FF8A6A]"
                              : "bg-[#E8F6F5] text-[#1E8C86] border border-[#C7F1F3]"
                          }`}
                        >
                          {obs.reportedFlag}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-text mt-1 italic">
                        "{obs.evidenceQuote}"
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmObservations}
                disabled={isConfirming}
                className="btn-pill btn-teal-primary text-xs font-extrabold"
              >
                {isConfirming && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Findings into Clinical Intake</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl text-xs font-bold text-[#14283F]">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
