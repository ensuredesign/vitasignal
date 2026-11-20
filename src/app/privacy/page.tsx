"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  ShieldCheck,
  Trash2,
  Lock,
  Database,
  Cpu,
  Clock,
  RefreshCw,
  AlertTriangle,
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
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal uppercase tracking-wider">
            Governance & Privacy Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">
            PrivacyVault & Data Inventory
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            VitaSignal AI is engineered with rigorous data minimization, strict ephemeral retention (maximum 24 hours), and zero real Personal Health Information (PHI) storage.
          </p>
        </div>

        {/* Data Inventory Table */}
        <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
          <h3 className="font-bold text-navy text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-teal" />
            <span>Prototype Data Inventory</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-100 text-slate-text">
                  <th className="py-2.5 font-bold">Category</th>
                  <th className="py-2.5 font-bold">Scope / Values</th>
                  <th className="py-2.5 font-bold">Storage Location</th>
                  <th className="py-2.5 font-bold">Retention Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 text-navy font-medium">
                <tr>
                  <td className="py-2.5">Demographics</td>
                  <td className="py-2.5 text-slate-text">Coarse age brackets only (e.g., 25_34). No DOB or names.</td>
                  <td className="py-2.5">Per-session isolated record</td>
                  <td className="py-2.5">Auto-expires in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-2.5">Clinical Intake</td>
                  <td className="py-2.5 text-slate-text">Discrete yes/no/unknown flags. Zero free-text input.</td>
                  <td className="py-2.5">Assessment table (revision-locked)</td>
                  <td className="py-2.5">Auto-expires in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-2.5">Lab Fixtures</td>
                  <td className="py-2.5 text-slate-text">Allowlisted synthetic text fixtures only. No uploads.</td>
                  <td className="py-2.5">Server extraction candidate</td>
                  <td className="py-2.5">Auto-expires in 24 hours</td>
                </tr>
                <tr>
                  <td className="py-2.5">Coordinator Handoff</td>
                  <td className="py-2.5 text-slate-text">Immutable snapshot of user-checked fields only.</td>
                  <td className="py-2.5">CareShare table (RLS protected)</td>
                  <td className="py-2.5">Instant revocation or 24h purge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI & Gemini Governance Card */}
        <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-3">
          <h3 className="font-bold text-navy text-base flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal" />
            <span>AI Subsystem & Gemini Governance</span>
          </h3>
          <p className="text-xs text-slate-text leading-relaxed">
            External AI processing is strictly limited to extracting explicit values, units, and flags from allowlisted synthetic reports. AI is never permitted to triage patients, determine clinical urgency, calculate fertility scores, or recommend treatments.
          </p>
          <div className="text-xs text-slate-text space-y-1 bg-navy-50 p-3 rounded-lg">
            <div>• <strong>Model:</strong> Configured via <code>GEMINI_MODEL</code> (gemini-3.8-flash)</div>
            <div>• <strong>Verification:</strong> Verbatim substring grounding required for every candidate observation.</div>
            <div>• <strong>Fallback:</strong> Offline fixture replay is immediately available if external AI is disabled or declined.</div>
          </div>
        </div>

        {/* Ephemeral Deletion & Purge Action */}
        <div className="bg-white rounded-2xl p-6 border border-urgent-border/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-urgent">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-base">Permanent Session Purge</h3>
          </div>
          <p className="text-xs text-slate-text leading-relaxed">
            {t.privacy.deleteWarning}
          </p>

          <button
            type="button"
            onClick={handleDeleteSession}
            disabled={isDeleting || deleteSuccess}
            className="px-6 py-2.5 bg-urgent text-white text-xs font-bold rounded-xl hover:bg-red-700 transition flex items-center gap-2"
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
