"use client";

import React from "react";
import Link from "next/link";
import { History } from "lucide-react";

interface AuditorNavProps {
  businessName?: string;
  category?: string;
  currentScore: number;
  maxScore?: number;
  answeredCount: number;
  totalQuestions?: number;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export function AuditorNav({
  businessName,
  currentScore,
  maxScore = 100,
  answeredCount,
  totalQuestions = 18,
  onOpenHistory,
  historyCount = 0,
}: AuditorNavProps) {
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 text-white border-b border-slate-800/90 shadow-lg backdrop-blur-md no-print">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand / Member Identifier */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs tracking-wider shrink-0 shadow-md flex items-center justify-center font-mono"
            title="Rethink Nutrition"
          >
            RN
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white block truncate">
                Rethink Nutrition
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-400 truncate hidden sm:inline">
                {businessName?.trim() ? businessName : "Clinical Intake"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              Clinical Diet & Metabolic Diagnostic
            </p>
          </div>
        </div>

        {/* Center/Right: Live Score Indicator & History */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Score Gauge Pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block leading-none">
                Metabolic Score
              </span>
              <div className="flex items-baseline gap-0.5 leading-none mt-1">
                <span className="text-lg sm:text-xl font-black tracking-tight font-mono text-white">
                  {currentScore}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 font-mono">
                  /{maxScore}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {/* Answer count */}
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block leading-none">
                Intake
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200 font-mono leading-none mt-1 block">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* History Icon */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              type="button"
              className="relative p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title="Audit History"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-mono text-[9px] font-black flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-900 h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
