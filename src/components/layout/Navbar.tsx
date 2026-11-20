"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { Activity, LogOut, Globe, Menu, X, Sparkles, Shield } from "lucide-react";

export function Navbar() {
  const { t, toggleLocale } = useLocale();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDiscreetExit = async () => {
    try {
      await fetch("/api/demo/session", { method: "DELETE" });
    } catch {
      // Ignore network errors on emergency exit
    }
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
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8F6F5] shadow-card no-print">
      {/* Flip7 Retro Warm Banner */}
      <div className="bg-[#FFF8E7] text-[#1E8C86] border-b border-[#F4ECD4] text-xs py-1.5 px-4 text-center font-bold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FFD23F] ring-2 ring-[#E6B800] animate-pulse"></span>
        <span className="tracking-wide">{t.common.syntheticBanner}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Flip7 Inspired Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#2BA8A2] shadow-teal-glow flex items-center justify-center text-white transform group-hover:scale-105 group-active:scale-95 transition-all">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-[#14283F] tracking-tight group-hover:text-[#2BA8A2] transition">
                VitaSignal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFD23F] text-[#14283F] font-extrabold text-xs shadow-accent-glow transform -rotate-2">
                AI
              </span>
              <span className="hidden md:inline-block ml-1 text-[11px] text-[#1E8C86] bg-[#E8F6F5] border border-[#C7F1F3] px-2.5 py-0.5 rounded-full font-bold">
                Challenge 01
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Flip7 Pill Style */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 ${
                    active
                      ? "text-[#1E8C86] bg-[#E8F6F5] border border-[#2BA8A2]/30 shadow-xs"
                      : "text-slate-text hover:text-[#14283F] hover:bg-[#EFF8F7]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bilingual Toggle Pill */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1E8C86] bg-[#FFF8E7] border border-[#F4ECD4] rounded-full hover:bg-[#F4ECD4] active:scale-95 transition-all shadow-xs"
              title="Switch language / تغيير اللغة"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-[#2BA8A2]" />
              <span>{t.common.language}</span>
            </button>

            {/* Discreet Exit Pill Button in Coral */}
            <button
              onClick={handleDiscreetExit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#EF6C4A] shadow-coral-glow rounded-full hover:bg-[#D45233] active:scale-95 transition-all"
              title="Discreet Exit (Redirects to Google immediately)"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{t.common.discreetExit}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#14283F] hover:bg-[#E8F6F5]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8F6F5] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                pathname === link.href
                  ? "text-[#1E8C86] bg-[#E8F6F5]"
                  : "text-slate-text hover:bg-[#EFF8F7]"
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
