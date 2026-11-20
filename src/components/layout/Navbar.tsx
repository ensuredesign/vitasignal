"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { Activity, ShieldCheck, LogOut, Globe, Menu, X, AlertTriangle } from "lucide-react";

export function Navbar() {
  const { t, locale, toggleLocale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDiscreetExit = async () => {
    try {
      await fetch("/api/demo/session", { method: "DELETE" });
    } catch {
      // Ignore network errors on emergency exit
    }
    // Immediately redirect to landing or blank page
    window.location.href = "https://www.google.com";
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/demo", label: t.nav.demoScenarios },
    { href: "/assessment", label: t.nav.intake },
    { href: "/assessment/result", label: t.nav.results },
    { href: "/care", label: t.nav.share },
    { href: "/review", label: t.nav.coordinator },
    { href: "/evidence", label: t.nav.evidence },
    { href: "/evaluation", label: t.nav.evaluation },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-navy-100 shadow-sm no-print">
      {/* Synthetic Demo Warning Banner */}
      <div className="bg-navy-800 text-offwhite text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-teal-100 animate-pulse"></span>
        <span>{t.common.syntheticBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-navy tracking-tight group-hover:text-teal transition">
                VitaSignal <span className="text-teal font-normal text-sm">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-text bg-navy-50 border border-navy-100 px-2 py-0.5 rounded-full font-medium">
                Challenge 01
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    active
                      ? "text-teal bg-teal-50 font-semibold"
                      : "text-slate-text hover:text-navy hover:bg-navy-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bilingual Toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-navy bg-navy-50 border border-navy-100 rounded-lg hover:bg-navy-100 transition"
              title="Switch language / تغيير اللغة"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-teal" />
              <span>{t.common.language}</span>
            </button>

            {/* Discreet Exit Button */}
            <button
              onClick={handleDiscreetExit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-urgent bg-urgent-bg border border-urgent-border rounded-lg hover:bg-red-100 transition"
              title="Discreet Exit (Redirects to Google immediately)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.common.discreetExit}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-navy hover:bg-navy-50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-navy-100 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? "text-teal bg-teal-50 font-semibold"
                  : "text-slate-text hover:bg-navy-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
