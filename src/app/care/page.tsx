"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  Lock,
  CheckCircle2,
  Share2,
  Trash2,
  Download,
  Clock,
  ArrowRight,
  ShieldCheck,
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
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
            PrivacyVault & Granular Sharing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14283F] mt-1">
            {t.privacy.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.privacy.subtitle}
          </p>
        </div>

        {/* ACTIVE SHARE STATUS CARD */}
        {activeShare ? (
          <div className="flip7-card flip7-card-sky p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8F6F5] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2BA8A2]" />
                <h3 className="font-extrabold text-[#14283F] text-lg">Active Share Snapshot</h3>
                <span className="px-3 py-0.5 rounded-full text-xs font-mono font-extrabold bg-[#2BA8A2] text-white">
                  {activeShare.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-text">
                <Clock className="w-4 h-4 text-[#2BA8A2]" />
                <span>Expires: {new Date(activeShare.expiresAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="text-xs text-slate-text">
              Share ID: <code className="font-mono text-[#14283F] font-bold">{activeShare.id}</code>
            </div>

            {/* Snapshot Preview in Flip7 Cream Surface */}
            <div className="bg-[#FFF8E7] rounded-2xl p-5 border border-[#F4ECD4] space-y-2">
              <h4 className="font-extrabold text-[#14283F] text-xs uppercase tracking-wider">
                {t.privacy.snapshotSummary} (Shared Fields Only)
              </h4>
              <div className="bg-white p-3.5 rounded-xl font-mono text-xs text-[#14283F] border border-[#F4ECD4] overflow-x-auto">
                <pre>{JSON.stringify(activeShare.snapshot?.selectedAnswers || {}, null, 2)}</pre>
              </div>
            </div>

            {/* Actions: View in Coordinator / Revoke / Download */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/review"
                className="btn-pill btn-teal-primary text-xs"
              >
                <span>View in Care Coordinator Panel</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="btn-pill bg-white text-[#14283F] border-2 border-[#1E8C86]/30 hover:bg-[#E8F6F5] text-xs"
              >
                <Download className="w-4 h-4" />
                <span>{t.common.download}</span>
              </button>

              <button
                type="button"
                onClick={handleRevokeShare}
                disabled={isRevoking}
                className="btn-pill btn-coral-urgent text-xs ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isRevoking ? "Revoking..." : t.privacy.revokeBtn}</span>
              </button>
            </div>
          </div>
        ) : (
          /* FIELD SELECTION FORM IN FLIP7 CARD */
          <div className="flip7-card flip7-card-gold p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-extrabold text-[#14283F] text-xl">
                {t.privacy.shareSectionTitle}
              </h3>
              <p className="text-xs text-slate-text mt-1">
                {t.privacy.shareSectionHelp}
              </p>
            </div>

            {selectableFields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectableFields.map((fieldKey) => {
                  const isChecked = selectedKeys.includes(fieldKey);
                  return (
                    <label
                      key={fieldKey}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-xs font-bold cursor-pointer transition-all ${
                        isChecked
                          ? "bg-[#FFF8E7] border-[#FFD23F] text-[#14283F] shadow-accent-glow"
                          : "bg-white border-[#E8F6F5] text-slate-text hover:border-[#2BA8A2]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleField(fieldKey)}
                        className="h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                      />
                      <span className="capitalize">{fieldKey.replace(/([A-Z])/g, " $1")}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-text italic p-4 bg-[#FFF8E7] rounded-2xl border border-[#F4ECD4]">
                No positive risk signals reported in this intake.
              </div>
            )}

            {/* Explicit Consent Checkbox in Cream Box */}
            <div className="bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl p-4 text-xs space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#2BA8A2] focus:ring-[#2BA8A2]"
                />
                <span className="font-bold text-[#14283F]">
                  I authorize creating an immutable snapshot containing ONLY the checked fields above. The snapshot expires automatically in 24 hours and can be revoked at any time.
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleCreateShare}
              disabled={selectedKeys.length === 0 || !consentChecked || isSharing}
              className="btn-pill btn-gold-cta text-xs font-extrabold disabled:opacity-50"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Generate Immutable Share Snapshot</span>
            </button>
          </div>
        )}

        {msg && (
          <div className="p-4 bg-[#FFF8E7] border border-[#F4ECD4] rounded-2xl text-xs font-bold text-[#14283F]">
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
