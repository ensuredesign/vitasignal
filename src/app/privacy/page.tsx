"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  ShieldCheck,
  Trash2,
  Database,
  Cpu,
  RefreshCw,
  Lock,
} from "lucide-react";

function PrivacyContent() {
  const { t } = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  const handleDeleteSession = async () => {
    if (!confirm("Are you sure you want to permanently erase all synthetic data for this session?")) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/demo/session", { method: "DELETE" });
      if (res.ok) {
        setDeleteSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch {
      // Error handling
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
            Governance & Privacy Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14283F] mt-1">
            PrivacyVault & Data Inventory
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            VitaSignal AI enforces strict data minimization, ephemeral retention (maximum 24 hours), and zero real Personal Health Information (PHI) storage.
          </p>
        </div>

        {/* Data Inventory Table in Flip7 Card */}
        <div className="flip7-card p-6 sm:p-8 space-y-5">
          <h3 className="font-extrabold text-[#14283F] text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-[#2BA8A2]" />
            <span>Prototype Data Inventory</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#E8F6F5] text-slate-text">
                  <th className="py-3 font-extrabold text-[#14283F]">Category</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Scope & Values</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Storage Location</th>
                  <th className="py-3 font-extrabold text-[#14283F]">Retention Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F6F5] text-[#14283F] font-medium">
                <tr>
                  <td className="py-3 font-bold">Demographics</td>
                  <td className="py-3 text-slate-text">Coarse age brackets only (e.g., 25_34). Zero names, DOB, or national IDs.</td>
                  <td className="py-3">Per-session isolated record</td>
                  <td className="py-3">Auto-purged in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">Clinical Intake</td>
                  <td className="py-3 text-slate-text">Discrete yes/no/unknown flags. Zero free-text health history.</td>
                  <td className="py-3">Assessment table (revision-locked)</td>
                  <td className="py-3">Auto-purged in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">Lab Fixtures</td>
                  <td className="py-3 text-slate-text">Allowlisted synthetic report fixtures only. No user document uploads.</td>
                  <td className="py-3">Server extraction candidates</td>
                  <td className="py-3">Auto-purged in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold">Coordinator Snapshot</td>
                  <td className="py-3 text-slate-text">Immutable projection of user-checked items only.</td>
                  <td className="py-3">CareShare table (RLS protected)</td>
                  <td className="py-3">Instant revocation or 24h purge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI & Gemini Governance in Cream Card */}
        <div className="flip7-card flip7-card-gold p-6 sm:p-8 space-y-4">
          <h3 className="font-extrabold text-[#14283F] text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#E6B800]" />
            <span>AI Subsystem & Gemini Governance</span>
          </h3>
          <p className="text-xs text-slate-text leading-relaxed">
            External AI processing is strictly limited to extracting explicit values, units, and flags from allowlisted synthetic laboratory text. The model is never permitted to triage patients, determine clinical urgency, calculate fertility scores, or prescribe treatment.
          </p>
          <div className="text-xs text-[#14283F] space-y-1.5 bg-[#FFF8E7] p-4 rounded-2xl border border-[#F4ECD4]">
            <div>• <strong>Model:</strong> Configured explicitly via <code>GEMINI_MODEL</code> (gemini-3.8-flash)</div>
            <div>• <strong>Verification:</strong> Verbatim substring grounding required for every candidate observation.</div>
            <div>• <strong>Fallback:</strong> Offline fixture replay is immediately available if external AI is disabled or declined.</div>
          </div>
        </div>

        {/* Ephemeral Deletion Action in Coral */}
        <div className="flip7-card flip7-card-coral p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#EF6C4A]">
            <Trash2 className="w-5 h-5 stroke-[2.5]" />
            <h3 className="font-extrabold text-lg">Permanent Session Purge</h3>
          </div>
          <p className="text-xs text-slate-text leading-relaxed">
            {t.privacy.deleteWarning}
          </p>

          <button
            type="button"
            onClick={handleDeleteSession}
            disabled={isDeleting || deleteSuccess}
            className="btn-pill btn-coral-urgent text-xs font-extrabold"
          >
            {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{deleteSuccess ? "Session Erased!" : t.privacy.deleteSessionBtn}</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LocaleProvider>
      <PrivacyContent />
    </LocaleProvider>
  );
}
