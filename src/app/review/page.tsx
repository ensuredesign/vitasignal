"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  Users,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

function CoordinatorReviewContent() {
  const { t } = useLocale();
  const [shareData, setShareData] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchActiveShare = async () => {
    try {
      const res = await fetch("/api/share/current");
      if (res.ok) {
        const data = await res.json();
        setShareData(data.share);
        setEvents(data.events || []);
      } else {
        setShareData(null);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveShare();
  }, []);

  const handleAdvanceState = async (nextEventType: string) => {
    if (!shareData) return;
    setIsUpdating(true);
    try {
      const idempotencyKey = `evt_${Date.now()}_${nextEventType}`;
      const res = await fetch("/api/care/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId: shareData.id,
          eventType: nextEventType,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to update state");
      }

      await fetchActiveShare();
    } catch (err: any) {
      alert(`Transition error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-base">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#2BA8A2] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const latestEvent = events.length > 0 ? events[events.length - 1].eventType : "none";

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
            CareLoop Simulated Coordinator
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14283F] mt-1">
            {t.coordinator.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.coordinator.subtitle}
          </p>
        </div>

        {/* SIMULATION DISCLAIMER BANNER IN CREAM */}
        <div className="bg-[#FFF8E7] border-2 border-[#F4ECD4] rounded-2xl p-4 text-xs text-[#14283F] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#E6B800] flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Strict Prototype Simulation:</strong> {t.coordinator.simulationNotice}. The coordinator has access ONLY to the user-approved snapshot projection, preserving medical privacy.
          </div>
        </div>

        {!shareData ? (
          <div className="flip7-card p-8 text-center space-y-4">
            <Users className="w-12 h-12 text-[#2BA8A2] mx-auto opacity-40" />
            <h3 className="font-extrabold text-[#14283F] text-xl">{t.coordinator.noActiveShare}</h3>
            <p className="text-xs text-slate-text max-w-md mx-auto">
              To experience the simulated handoff workflow, return to the assessment result and select fields to share.
            </p>
            <Link href="/assessment/result" className="btn-pill btn-teal-primary text-xs inline-flex">
              Go to Care Pathway
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Snapshot Details Card */}
            <div className="flip7-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8F6F5] pb-3">
                <span className="text-xs font-extrabold text-[#2BA8A2] uppercase tracking-wider">
                  Received Snapshot Projection
                </span>
                <span className="text-xs font-mono text-slate-text">
                  Share ID: {shareData.id}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-[#14283F] uppercase tracking-wider mb-2">
                  Patient Shared Findings
                </h4>
                <div className="bg-[#FFF8E7] p-4 rounded-2xl font-mono text-xs text-[#14283F] border border-[#F4ECD4]">
                  <pre>{JSON.stringify(shareData.snapshot?.selectedAnswers || {}, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* State Machine Timeline Card */}
            <div className="flip7-card flip7-card-gold p-6 sm:p-8 space-y-6">
              <h3 className="font-extrabold text-[#14283F] text-xl">
                {t.coordinator.timelineTitle}
              </h3>

              {/* Progress Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "shared", label: "1. Shared" },
                  { id: "acknowledged", label: "2. Acknowledged" },
                  { id: "simulated_scheduled", label: "3. Outreach Simulated" },
                  { id: "simulated_completed", label: "4. Care Completed" },
                ].map((st) => {
                  const hasReached = events.some((e) => e.eventType === st.id);
                  const isCurrent = latestEvent === st.id;
                  return (
                    <div
                      key={st.id}
                      className={`btn-pill text-xs py-2 px-3 justify-center border transition-all ${
                        isCurrent
                          ? "btn-gold-cta font-extrabold"
                          : hasReached
                          ? "bg-[#2BA8A2] text-white border-[#2BA8A2]"
                          : "bg-white text-slate-text border-[#E8F6F5] opacity-60"
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>

              {/* Transition Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E8F6F5]">
                {latestEvent === "shared" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceState("acknowledged")}
                    disabled={isUpdating}
                    className="btn-pill btn-teal-primary text-xs"
                  >
                    {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t.coordinator.actionAcknowledge}</span>
                  </button>
                )}

                {latestEvent === "acknowledged" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceState("simulated_scheduled")}
                    disabled={isUpdating}
                    className="btn-pill btn-gold-cta text-xs"
                  >
                    {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t.coordinator.actionSchedule}</span>
                  </button>
                )}

                {latestEvent === "simulated_scheduled" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceState("simulated_completed")}
                    disabled={isUpdating}
                    className="btn-pill btn-teal-primary text-xs"
                  >
                    {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t.coordinator.actionComplete}</span>
                  </button>
                )}

                {latestEvent === "simulated_completed" && (
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#2BA8A2] bg-[#E8F6F5] px-4 py-2 rounded-full border border-[#C7F1F3]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulated Care Loop Successfully Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <LocaleProvider>
      <CoordinatorReviewContent />
    </LocaleProvider>
  );
}
