"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { Shield, BookOpen, AlertCircle, Heart } from "lucide-react";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="bg-white border-t border-[#E8F6F5] mt-auto py-10 text-sm text-slate-text no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#14283F] flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#2BA8A2] text-white flex items-center justify-center text-xs font-bold">
                VS
              </span>
              VitaSignal AI
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              {t.common.notValidatedNotice}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF8E7] text-[#1E8C86] text-[11px] font-bold border border-[#F4ECD4]">
              <Heart className="w-3.5 h-3.5 text-[#EF6C4A] fill-current" />
              <span>Future Health Digital Innovation 2026</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#14283F] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2BA8A2]" />
              Evidence & Guideline Citations
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              Grounded in WHO (2025), AUA/ASRM (2020/2024), EAU (2024), and NHS Emergency Pathways.
            </p>
            <div>
              <Link
                href="/evidence"
                className="text-xs text-[#2BA8A2] font-bold hover:underline inline-flex items-center gap-1"
              >
                View Evidence Registry (C1–C5) →
              </Link>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#EF6C4A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Emergency Safety First
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              {t.common.emergencyNotice}
            </p>
          </div>
        </div>

        <div className="dashed-divider"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-text font-medium">
          <p>© 2026 VitaSignal AI • Built with Flip7 Retro-Playful Design System (Light Theme)</p>
          <div className="flex items-center gap-5 mt-3 sm:mt-0">
            <Link href="/privacy" className="hover:text-[#2BA8A2] transition">
              PrivacyVault
            </Link>
            <Link href="/evidence" className="hover:text-[#2BA8A2] transition">
              Clinical Citations
            </Link>
            <Link href="/evaluation" className="hover:text-[#2BA8A2] transition">
              Test Benchmark
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
