"use client";

import React, { useState } from "react";
import { SYNTHETIC_REPORTS, SyntheticReportFixture } from "@/lib/fixtures/reports";
import { useLocale } from "@/lib/i18n/context";
import { FileText, Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

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
      // Default: check all observations where lab flag is abnormal or user wants to verify
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
      {/* Fixture Selector */}
      <div className="bg-white border border-navy-100 rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-bold text-navy mb-2">
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
              className={`p-3 text-left rounded-lg border text-xs transition ${
                selectedFixtureId === rep.id
                  ? "border-teal bg-teal-50 text-navy font-semibold ring-1 ring-teal"
                  : "border-navy-100 bg-navy-50 text-slate-text hover:bg-navy-100"
              }`}
            >
              <div className="font-bold text-navy flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-teal" />
                {rep.id}
              </div>
              <div className="text-[11px] leading-tight text-slate-text line-clamp-2">
                {rep.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Synthetic Text Display */}
      {fixture && (
        <div className="bg-navy-900 text-teal-100 font-mono text-xs rounded-xl p-4 relative overflow-x-auto border border-navy-700">
          <div className="absolute top-2 right-2 text-[10px] bg-red-950/80 text-red-200 border border-red-800 px-2 py-0.5 rounded font-sans uppercase font-bold tracking-wider">
            {fixture.marker}
          </div>
          <pre className="whitespace-pre-wrap">{fixture.sourceText}</pre>
        </div>
      )}

      {/* Extraction Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleExtract("live_ai")}
          disabled={isExtracting}
          className="flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
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
          className="flex items-center gap-2 px-4 py-2 bg-navy-50 text-navy text-sm font-semibold rounded-lg border border-navy-100 hover:bg-navy-100 transition"
        >
          <ShieldCheck className="w-4 h-4 text-teal" />
          <span>{t.assessment.replayBtn}</span>
        </button>
      </div>

      {/* Extraction Status & Mode Pill */}
      {extractionResult && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span className="text-xs font-bold text-navy">
                {t.assessment.modeNotice}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-teal text-white">
                {extractionResult.mode}
              </span>
              <span className="text-xs text-slate-text">
                ({extractionResult.model} • {extractionResult.latencyMs}ms)
              </span>
            </div>
            <span className="text-xs font-semibold text-teal-800">
              {extractionResult.observations?.length || 0} observations extracted & verified
            </span>
          </div>

          {/* Observations Table */}
          <div>
            <h5 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
              {t.assessment.confirmCandidatesTitle}
            </h5>
            <p className="text-xs text-slate-text mb-3">
              {t.assessment.confirmCandidatesHelp}
            </p>

            <div className="space-y-2">
              {extractionResult.observations?.map((obs: any, idx: number) => {
                const isChecked = confirmedCandidateIds.includes(obs.id);
                return (
                  <div
                    key={obs.id || idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition ${
                      isChecked
                        ? "bg-white border-teal shadow-xs"
                        : "bg-navy-50/60 border-navy-100 opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`cand_${obs.id}`}
                      checked={isChecked}
                      onChange={() => toggleCandidate(obs.id)}
                      className="mt-1 h-4 w-4 rounded text-teal focus:ring-teal"
                    />
                    <label htmlFor={`cand_${obs.id}`} className="flex-1 text-xs cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy capitalize">
                          {obs.field.replace("_", " ")}:
                        </span>
                        <span className="font-mono font-semibold text-teal-800">
                          {obs.rawValue} {obs.unit || ""}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            obs.reportedFlag === "abnormal"
                              ? "bg-red-100 text-red-700"
                              : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {obs.reportedFlag}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-text mt-1 italic font-sans">
                        Evidence Quote: "{obs.evidenceQuote}"
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleConfirmObservations}
                disabled={isConfirming}
                className="w-full sm:w-auto px-6 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-900 transition flex items-center justify-center gap-2"
              >
                {isConfirming && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Selected Findings into Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 bg-navy-50 border border-navy-200 rounded-lg text-xs font-medium text-navy">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
