"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider, useLocale } from "@/lib/i18n/context";
import {
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Lock,
} from "lucide-react";

function CoordinatorReviewContent() {
  const { t } = useLocale();
  const [shareData, setShareData] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    } catch (err: any) {
      setErrorMsg(err.message);
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
      <div className="min-h-screen flex flex-col bg-offwhite">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-teal animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const latestEvent = events.length > 0 ? events[events.length - 1].eventType : "none";

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <Navbar />

      <main className="flex-1 py-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal uppercase tracking-wider">
            CareLoop Simulated Coordinator
          </span>
          <h1 className="text-3xl font-extrabold text-navy mt-1">
            {t.coordinator.title}
          </h1>
          <p className="text-sm text-slate-text mt-2 leading-relaxed">
            {t.coordinator.subtitle}
          </p>
        </div>

        {/* SIMULATION DISCLAIMER BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Strict Prototype Simulation:</strong> {t.coordinator.simulationNotice}. Raw intake answers are never disclosed here—only the user-selected snapshot fields.
          </div>
        </div>

        {!shareData ? (
          <div className="bg-white rounded-2xl p-8 border border-navy-100 shadow-sm text-center space-y-4">
            <Users className="w-10 h-10 text-slate-text mx-auto opacity-50" />
            <h3 className="font-bold text-navy text-lg">{t.coordinator.noActiveShare}</h3>
            <p className="text-xs text-slate-text max-w-md mx-auto">
              To experience the simulated handoff workflow, return to the assessment result and select fields to share.
            </p>
            <Link
              href="/assessment/result"
              className="px-6 py-2.5 bg-teal text-white text-xs font-bold rounded-lg inline-block"
            >
              Go to Care Pathway
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Snapshot Details Card */}
            <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-navy-50 pb-3">
                <span className="text-xs font-bold text-teal uppercase tracking-wider">
                  Received Snapshot Projection
                </span>
                <span className="text-xs font-mono text-slate-text">
                  Share ID: {shareData.id}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                  Shared Findings
                </h4>
                <div className="bg-navy-50 p-4 rounded-xl font-mono text-xs text-navy">
                  <pre>{JSON.stringify(shareData.snapshot?.selectedAnswers || {}, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* State Machine Timeline Card */}
            <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm space-y-6">
              <h3 className="font-bold text-navy text-base">
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
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                        isCurrent
                          ? "bg-teal text-white border-teal shadow-xs"
                          : hasReached
                          ? "bg-navy-700 text-white border-navy-700"
                          : "bg-navy-50 text-slate-text border-navy-100 opacity-60"
                      }`}
                    >
                      {st.label}
                    </div>
                  );
                })}
              </div>

              {/* Event Transition Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-navy-50">
                {latestEvent === "shared" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceState("acknowledged")}
                    disabled={isUpdating}
                    className="px-5 py-2.5 bg-teal text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
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
                    className="px-5 py-2.5 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-900 transition flex items-center gap-2"
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
                    className="px-5 py-2.5 bg-teal text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
                  >
                    {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t.coordinator.actionComplete}</span>
                  </button>
                )}

                {latestEvent === "simulated_completed" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-teal">
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
