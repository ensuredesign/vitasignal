"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Trash2,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";

function CareShareContent() {
  const { t } = useLocale();
  const [assessment, setAssessment] = useState<any | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [activeShare, setActiveShare] = useState<any | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/assessment");
        if (res.ok) {
          const data = await res.json();
          setAssessment(data.assessment);
        }

        // Check if an active share already exists
        const shareRes = await fetch("/api/share/current");
        if (shareRes.ok) {
          const shareData = await shareRes.json();
          setActiveShare(shareData.share);
        }
      } catch {
        // Handle error
      }
    }
    load();
  }, []);

  const toggleField = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCreateShare = async () => {
    if (!assessment || selectedKeys.length === 0 || !consentChecked) return;
    setIsSharing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment.id,
          expectedRevision: assessment.revision,
          selectedFieldKeys: selectedKeys,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create share");
      }

      setActiveShare({
        id: data.shareId,
        expiresAt: data.expiresAt,
        status: data.status,
        snapshot: data.snapshot,
      });
      setMsg("Granular share snapshot successfully generated.");
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!activeShare) return;
    setIsRevoking(true);
    try {
      const res = await fetch("/api/share/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId: activeShare.id }),
      });
      if (res.ok) {
        setActiveShare(null);
        setMsg("Share grant revoked immediately. Data is no longer accessible.");
      }
    } catch (err: any) {
      setMsg(`Revocation failed: ${err.message}`);
    } finally {
      setIsRevoking(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectableFields = assessment?.answers
    ? Object.keys(assessment.answers).filter(
        (k) =>
          !["suddenSevereTesticularPain", "painWithNauseaOrVomiting"].includes(k) &&
          assessment.answers[k] !== "no"
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal uppercase tracking-wider">
            PrivacyVault & Access Control
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">
            {t.privacy.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.privacy.subtitle}
          </p>
        </div>

        {/* ACTIVE SHARE STATUS CARD */}
        {activeShare ? (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal" />
                <h3 className="font-bold text-navy text-base">Active Share Snapshot</h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-teal text-white">
                  {activeShare.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-text">
                <Clock className="w-4 h-4 text-teal" />
                <span>Expires: {new Date(activeShare.expiresAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="text-xs text-slate-text">
              Share ID: <code className="font-mono text-navy font-bold">{activeShare.id}</code>
            </div>

            {/* Snapshot Preview */}
            <div className="bg-white rounded-xl p-4 border border-teal-100 space-y-2">
              <h4 className="font-bold text-navy text-xs uppercase tracking-wider">
                {t.privacy.snapshotSummary} (Shared Fields Only)
              </h4>
              <div className="bg-navy-50/70 p-3 rounded-lg font-mono text-xs text-navy overflow-x-auto">
                <pre>{JSON.stringify(activeShare.snapshot?.selectedAnswers || {}, null, 2)}</pre>
              </div>
            </div>

            {/* Actions: View in Coordinator / Revoke / Download */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/review"
                className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-900 transition flex items-center gap-1.5"
              >
                <span>View in Care Coordinator Panel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-navy-200 text-navy text-xs font-semibold rounded-lg hover:bg-navy-50 transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.common.download}</span>
              </button>

              <button
                type="button"
                onClick={handleRevokeShare}
                disabled={isRevoking}
                className="px-4 py-2 bg-urgent-bg border border-urgent-border text-urgent text-xs font-bold rounded-lg hover:bg-red-100 transition flex items-center gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRevoking ? "Revoking..." : t.privacy.revokeBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          /* FIELD SELECTION FORM */
          <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-navy text-base">
                {t.privacy.shareSectionTitle}
              </h3>
              <p className="text-xs text-slate-text mt-1">
                {t.privacy.shareSectionHelp}
              </p>
            </div>

            {selectableFields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectableFields.map((fieldKey) => {
                  const isChecked = selectedKeys.includes(fieldKey);
                  return (
                    <label
                      key={fieldKey}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        isChecked
                          ? "bg-teal-50 border-teal text-navy font-semibold ring-1 ring-teal"
                          : "bg-navy-50/50 border-navy-100 text-slate-text hover:bg-navy-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleField(fieldKey)}
                        className="h-4 w-4 rounded text-teal focus:ring-teal"
                      />
                      <span className="capitalize">{fieldKey.replace(/([A-Z])/g, " $1")}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-text italic p-4 bg-navy-50 rounded-lg">
                No positive risk signals reported in this intake.
              </div>
            )}

            {/* Explicit Consent Checkbox */}
            <div className="bg-navy-50/80 border border-navy-100 rounded-xl p-4 text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-teal focus:ring-teal"
                />
                <span className="font-semibold text-navy">
                  I authorize generating an immutable snapshot of the selected fields for simulated care coordinator handoff. (Expires automatically in 24 hours).
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleCreateShare}
              disabled={selectedKeys.length === 0 || !consentChecked || isSharing}
              className="px-6 py-2.5 bg-teal text-white text-xs font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
            >
              {isSharing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <Share2 className="w-3.5 h-3.5" />
              <span>Generate Immutable Share Snapshot</span>
            </button>
          </div>
        )}

        {msg && (
          <div className="p-3 bg-navy-50 border border-navy-200 rounded-lg text-xs font-semibold text-navy">
            {msg}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CareSharePage() {
  return (
    <LocaleProvider>
      <CareShareContent />
    </LocaleProvider>
  );
}
