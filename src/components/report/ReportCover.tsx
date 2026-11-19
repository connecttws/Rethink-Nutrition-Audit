"use client";

import React from "react";
import {
  ShieldCheck,
  Calendar,
  User,
  Scale,
  Utensils,
  Target,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  HeartPulse,
} from "lucide-react";
import { AuditRecord } from "@/lib/audit-data";

interface ReportCoverProps {
  record: AuditRecord;
}

export function ReportCover({ record }: ReportCoverProps) {
  const score = record.totalScore;

  // Theme based on score
  const getTheme = (s: number) => {
    if (s >= 90) {
      return {
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        strokeColor: "#10B981",
        statusLabel: "Optimal Metabolic Conditioning",
        statusIcon: CheckCircle2,
      };
    }
    if (s >= 70) {
      return {
        badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        strokeColor: "#0EA5E9",
        statusLabel: "Solid Foundation",
        statusIcon: TrendingUp,
      };
    }
    if (s >= 40) {
      return {
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        strokeColor: "#F59E0B",
        statusLabel: "Moderate Metabolic Drag",
        statusIcon: AlertTriangle,
      };
    }
    return {
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      strokeColor: "#EF4444",
      statusLabel: "Severe Deficit / Reset Needed",
      statusIcon: AlertOctagon,
    };
  };

  const theme = getTheme(score);
  const StatusIcon = theme.statusIcon;

  // Radial progress calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800/90 space-y-7">
      {/* Ambient background lighting */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: theme.strokeColor }}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-emerald-600/15" />

      <div className="relative z-10 space-y-7">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>RN • Rethink Nutrition • Clinical Diet & Metabolic Diagnostic</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800">
              Diagnostic ID: {record.id}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(record.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Hero Main: Client Details + Radial Gauge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-1">
          <div className="space-y-4 flex-1">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/80 text-xs font-semibold text-emerald-300">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target: {record.business.category}</span>
              </span>

              {record.business.age && (
                <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-200">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    Age: <strong>{record.business.age}</strong>
                    {record.business.biologicalSex ? ` • ${record.business.biologicalSex}` : ""}
                  </span>
                </span>
              )}

              {record.business.dietPreference && (
                <span className="inline-flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/80 text-xs font-medium text-emerald-300">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{record.business.dietPreference}</span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${theme.badgeBg}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{theme.statusLabel}</span>
              </span>
            </div>

            {/* Client Title & Headline */}
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                Personalized Clinical Diagnostic
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {record.business.name}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-medium mt-2 leading-relaxed max-w-2xl">
                {record.band.headline}
              </p>
            </div>

            {/* Nutritionist signature pill */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 font-mono">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Diagnostic Conducted by:{" "}
                <strong className="text-slate-200 font-semibold">
                  {record.business.auditorName || "Rethink Clinical Nutritionist"}
                </strong>
              </span>
            </div>
          </div>

          {/* Radial SVG Score Gauge */}
          <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800/90 shadow-xl shrink-0">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="9"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Dynamic Value Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={theme.strokeColor}
                  strokeWidth="9"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>

              {/* Central Text Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white leading-none">
                  {score}
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                  / 100
                </span>
              </div>
            </div>

            <div className="text-center sm:text-center">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 block">
                Metabolic Health Index
              </span>
              <span
                className="text-xs font-bold uppercase tracking-wider block mt-0.5"
                style={{ color: theme.strokeColor }}
              >
                {record.band.title}
              </span>
            </div>
          </div>
        </div>

        {/* Biometrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Body Mass Index (BMI)
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {record.business.bmi ? `${record.business.bmi} kg/m²` : "29.0 kg/m²"}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
              {record.business.bmiCategory || "Assessed Category"}
            </span>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Current Wt & Gap
            </span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {record.business.weightKg ? `${record.business.weightKg} kg` : "76.0 kg"}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
              {record.business.weightGapKg ? `Gap: ${record.business.weightGapKg}` : "Gap: -16.0 kg"}
            </span>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Daily Protein Need
            </span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {record.business.proteinNeedMin && record.business.proteinNeedMax
                ? `${record.business.proteinNeedMin} - ${record.business.proteinNeedMax}g / day`
                : "91 - 114g / day"}
            </span>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              1.2g–1.5g / kg Optimal
            </span>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Healthy Target Range
            </span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {record.business.optimalMinKg && record.business.optimalMaxKg
                ? `${record.business.optimalMinKg} - ${record.business.optimalMaxKg} kg`
                : "49 - 65 kg"}
            </span>
            <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
              Height: {record.business.heightCm || "162"} cm
            </span>
          </div>
        </div>

        {/* Diagnosis & Improvement Vectors Strip */}
        <div className="bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Diagnosis & Primary Metabolic Vectors:</span>
            <span className="text-white">
              {record.diagnosis?.headline || "Daily Protein Density & Night Cravings & Liquid Calories"}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
            {record.band.description}
          </p>
        </div>
      </div>
    </div>
  );
}
