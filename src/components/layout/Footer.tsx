"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { Shield, BookOpen, AlertCircle } from "lucide-react";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="bg-white border-t border-navy-100 mt-auto py-8 text-sm text-slate-text no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-navy mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal" />
              VitaSignal AI
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              {t.common.notValidatedNotice}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-navy mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal" />
              Evidence & Standards
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              Decision logic grounded in peer-reviewed clinical guidelines: WHO (2025), AUA/ASRM (2020/2024), EAU (2024), and NHS Emergency Pathways.
            </p>
            <div className="mt-2">
              <Link href="/evidence" className="text-xs text-teal font-medium hover:underline">
                View Evidence Registry (C1–C5) →
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-urgent mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Emergency Safety
            </h4>
            <p className="text-xs leading-relaxed text-slate-text">
              {t.common.emergencyNotice}
            </p>
          </div>
        </div>

        <div className="border-t border-navy-50 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-text">
          <p>© 2026 VitaSignal AI • Future Health Digital Innovation Challenge (Challenge 01)</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:text-navy transition">
              Privacy & Retention
            </Link>
            <Link href="/evidence" className="hover:text-navy transition">
              Clinical Citations
            </Link>
            <Link href="/evaluation" className="hover:text-navy transition">
              Test Benchmark
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
