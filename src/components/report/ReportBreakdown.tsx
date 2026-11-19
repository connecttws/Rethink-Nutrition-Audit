"use client";

import React from "react";
import {
  Utensils,
  Coffee,
  Calendar,
  ShieldAlert,
  Moon,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
} from "lucide-react";
import { SectionScore } from "@/lib/audit-data";

interface ReportBreakdownProps {
  sectionScores: SectionScore[];
}

interface PillarConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  borderClass: string;
  badgeBg: string;
  description: string;
  impactMetric: string;
}

const PILLAR_CONFIGS: Record<string, PillarConfig> = {
  protein: {
    icon: Utensils,
    color: "#10B981", // Emerald
    gradient: "from-emerald-500 to-teal-600",
    borderClass: "border-emerald-200",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Structured protein distribution (1.2–1.5g/kg) across all 3 meals stabilizes morning blood sugar and delivers 4–5 hours of effortless satiety.",
    impactMetric: "1.2–1.5g/kg Optimal Daily Intake",
  },
  liquid_sugar: {
    icon: Coffee,
    color: "#F59E0B", // Amber
    gradient: "from-amber-500 to-orange-600",
    borderClass: "border-amber-200",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    description:
      "Eliminating 3–5 daily sweet chais, fruit smoothies, and refined palm-oil 5 PM namkeen stops ~15,000 monthly hidden calories entering liver fat.",
    impactMetric: "Zero Liquid Fructose & Palm Oil",
  },
  weekend_social: {
    icon: Calendar,
    color: "#8B5CF6", // Purple
    gradient: "from-purple-500 to-indigo-600",
    borderClass: "border-purple-200",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Calibrated 7-day social roadmaps prevent weekend takeout blowouts, alcohol fat oxidation blocks, and self-defeating Monday crash detox cycles.",
    impactMetric: "7-Day Consistent Deficit Maintenance",
  },
  gut_digestion: {
    icon: ShieldAlert,
    color: "#EF4444", // Rose
    gradient: "from-rose-500 to-red-600",
    borderClass: "border-rose-200",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Resolving daily distension, acid reflux, and sluggish transit through 30g+ soluble fiber and homemade probiotics restores a flat stomach.",
    impactMetric: "30g+ Fiber & Clean Colon Clearance",
  },
  cravings_stress: {
    icon: Moon,
    color: "#EC4899", // Pink
    gradient: "from-pink-500 to-rose-600",
    borderClass: "border-pink-200",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
    description:
      "Breaking the post-dinner dopamine sweet loop, managing cortisol stress eating, and closing the kitchen by 8:30 PM ensures a 12h fasting window.",
    impactMetric: "12h Overnight Fasting Window",
  },
  hormonal_energy: {
    icon: HeartPulse,
    color: "#0284C7", // Sky
    gradient: "from-sky-500 to-blue-600",
    borderClass: "border-sky-200",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    description:
      "Addressing Thyroid, PCOS, fatty liver markers, eliminating 3 PM energy crashes, and resetting the metabolic rate after past crash diets.",
    impactMetric: "Metabolic Flexibility & Normal Biomarkers",
  },
};

export function ReportBreakdown({ sectionScores }: ReportBreakdownProps) {
  return (
    <div className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Clinical Diagnostic Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
            6 Nutritional & Metabolic Pillars Breakdown
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Standardized evaluation across all 6 core clinical pillars (100 total potential points).
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold self-start sm:self-auto border border-slate-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Full 6-Pillar Score</span>
        </div>
      </div>

      {/* 6 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionScores.map((sec, idx) => {
          const config = PILLAR_CONFIGS[sec.id] || {
            icon: Sparkles,
            color: "#10B981",
            gradient: "from-emerald-500 to-teal-600",
            borderClass: "border-slate-200",
            badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
            description: "",
            impactMetric: "",
          };
          const Icon = config.icon;
          const pct = Math.round((sec.score / sec.maxScore) * 100);

          let statusTheme = {
            label: "Optimal Intake",
            colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
            icon: CheckCircle2,
          };
          if (pct < 40) {
            statusTheme = {
              label: "High Deficit Gap",
              colorClass: "text-rose-700 bg-rose-50 border-rose-200",
              icon: AlertOctagon,
            };
          } else if (pct < 70) {
            statusTheme = {
              label: "Needs Optimization",
              colorClass: "text-amber-700 bg-amber-50 border-amber-200",
              icon: AlertTriangle,
            };
          }

          const StatusIcon = statusTheme.icon;

          return (
            <div
              key={sec.id}
              className="p-5 sm:p-6 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md flex flex-col justify-between space-y-4 border-slate-200/90"
            >
              <div className="space-y-3">
                {/* Pillar Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: config.color }}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        Pillar 0{idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {sec.name}
                      </h3>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border shrink-0 ${statusTheme.colorClass}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusTheme.label}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {config.description}
                </p>
              </div>

              {/* Score Bar & Metric */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-500">
                    {config.impactMetric}
                  </span>
                  <span className="font-black text-slate-950 text-sm">
                    {sec.score} / {sec.maxScore}{" "}
                    <span className="text-slate-400 font-normal text-xs">
                      ({pct}%)
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
