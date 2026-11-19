"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Scale,
  Flame,
  Utensils,
  Target,
} from "lucide-react";
import {
  AuditRecord,
  formatWhatsAppUrl,
  isValidIndianMobile,
} from "@/lib/audit-data";
import { saveAuditToStorage } from "@/lib/audit-storage";

interface AuditCompleteStepProps {
  record: AuditRecord;
  onReviewAnswers: () => void;
  onReset: () => void;
}

export function AuditCompleteStep({
  record,
  onReviewAnswers,
  onReset,
}: AuditCompleteStepProps) {
  const [copied, setCopied] = useState(false);
  const [clientPhone, setClientPhone] = useState(
    record.business.whatsappNumber || record.business.phone || ""
  );
  const [phoneError, setPhoneError] = useState("");
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [wasSent, setWasSent] = useState(false);

  // Clean short report URL (/r/[id])
  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${record.id}`
      : `/r/${record.id}`;

  const cleanDigits = (clientPhone || "").replace(/\D/g, "");
  const isPhoneValid = isValidIndianMobile(clientPhone);

  const handlePhoneChange = (val: string) => {
    setClientPhone(val);
    setPhoneError("");
    setWasSent(false);
    record.business.whatsappNumber = val;
    record.business.phone = val;
    saveAuditToStorage(record);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Please copy the URL manually from your browser address bar.");
    }
  };

  const generateWhatsAppMessage = () => {
    const ageSexStr =
      record.business.age || record.business.biologicalSex
        ? ` (${[record.business.age ? `Age: ${record.business.age}` : "", record.business.biologicalSex || ""].filter(Boolean).join(", ")})`
        : "";
    const bmiStr = record.business.bmi
      ? `*Live BMI:* ${record.business.bmi} kg/m² (${record.business.bmiCategory || "Assessed"})\n`
      : "";
    const weightGapStr = record.business.weightGapKg
      ? `*Weight Gap to Target:* ${record.business.weightGapKg}\n`
      : "";
    const proteinStr =
      record.business.proteinNeedMin && record.business.proteinNeedMax
        ? `*Daily Protein Target:* ${record.business.proteinNeedMin} - ${record.business.proteinNeedMax}g / day\n`
        : "";
    const dietStr = record.business.dietPreference
      ? `*Dietary Baseline:* ${record.business.dietPreference}\n`
      : "";

    return (
      `*RN • Rethink Nutrition • Clinical Diet & Metabolic Diagnostic*\n\n` +
      `*Client:* ${record.business.name}${ageSexStr}\n` +
      `*Primary Nutritional Target:* ${record.business.category}\n` +
      dietStr +
      bmiStr +
      weightGapStr +
      proteinStr +
      `*Total Metabolic Health Score:* ${record.totalScore} / 100 — ${record.band.title}\n\n` +
      `*6-Pillar Clinical Breakdown:*\n` +
      record.sectionScores
        .map((s) => `• ${s.shortName || s.name}: ${s.score}/${s.maxScore}`)
        .join("\n") +
      `\n\n*Recommended Clinical Protocol:*\n${record.band.sprintRecommendation}\n\n` +
      `*View Complete Clinical Nutrition Report Online:*\n${reportUrl}\n\n` +
      `_Prepared by Rethink Clinical Nutrition Team._`
    );
  };

  const handleShareWhatsApp = () => {
    if (!isPhoneValid) {
      setPhoneError("Please enter a valid 10-digit mobile number to open WhatsApp directly.");
      return;
    }

    const text = generateWhatsAppMessage();
    const waUrl = formatWhatsAppUrl(clientPhone, text);
    setWasSent(true);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const score = record.totalScore;
  const getScoreTheme = (s: number) => {
    if (s >= 90) return { color: "#10B981", badge: "bg-emerald-500 text-slate-950" };
    if (s >= 70) return { color: "#0EA5E9", badge: "bg-sky-500 text-slate-950" };
    if (s >= 40) return { color: "#F59E0B", badge: "bg-amber-500 text-slate-950" };
    return { color: "#EF4444", badge: "bg-rose-500 text-white" };
  };
  const theme = getScoreTheme(score);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
              RN • Rethink Nutrition
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
            Clinical Diet Consultation — Summary & Dispatch
          </h2>
        </div>

        <button
          type="button"
          onClick={onReviewAnswers}
          className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
        >
          ← Edit Answers
        </button>
      </div>

      {/* Executive Client Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: theme.color }}
        />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Diagnostic Ref: {record.id}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {new Date(record.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-0.5 rounded-md text-emerald-300">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{record.business.category}</span>
                </span>
                {record.business.age && (
                  <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-0.5 rounded-md text-slate-300">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      {record.business.age} yrs
                      {record.business.biologicalSex ? ` • ${record.business.biologicalSex}` : ""}
                    </span>
                  </span>
                )}
                {record.business.dietPreference && (
                  <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-0.5 rounded-md text-slate-300">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{record.business.dietPreference}</span>
                  </span>
                )}
                {record.business.bmi && (
                  <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-0.5 rounded-md text-slate-300 font-mono">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      BMI: {record.business.bmi} ({record.business.bmiCategory})
                    </span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans">
                {record.business.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                {record.band.headline}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
              <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white block leading-none">
                  {record.totalScore}
                  <span className="text-xs text-slate-400 font-normal ml-0.5">/100</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1 block">
                  Metabolic Score
                </span>
              </div>

              <div>
                <span
                  className={`inline-block px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${theme.badge}`}
                >
                  {record.band.title}
                </span>
              </div>
            </div>
          </div>

          {/* 6-Pillar Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-800/80">
            {record.sectionScores.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80"
              >
                <span className="text-[11px] text-slate-400 block truncate font-medium">
                  {s.shortName || s.name}
                </span>
                <span className="text-base font-black font-mono text-white mt-0.5 block">
                  {s.score}
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                    /{s.maxScore}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Client WhatsApp Delivery Console */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
              Direct Client WhatsApp Dispatch
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            1-Tap Client Delivery
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Instantly dispatch the client's clinical diet diagnostic, BMI analysis, weight gap, and protein target directly to their WhatsApp chat with one tap.
        </p>

        {/* WhatsApp Phone Input Section */}
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Client Mobile Number *
              </label>
              {isPhoneValid ? (
                <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Valid number · Ready to send</span>
                </span>
              ) : cleanDigits.length > 0 ? (
                <span className="text-[11px] font-mono text-slate-400">
                  {10 - cleanDigits.length > 0
                    ? `Enter ${10 - cleanDigits.length} more digits`
                    : "Invalid format"}
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-400">
                  Enter 10-digit mobile
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-slate-700 font-mono text-xs font-bold border-r border-slate-200 pr-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91</span>
              </div>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Enter 10-digit mobile number (e.g. 98765 43210)"
                className={`w-full pl-20 pr-4 py-3.5 rounded-xl border bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs font-mono ${
                  phoneError
                    ? "border-red-400 focus:border-red-500 focus:bg-white ring-2 ring-red-100"
                    : isPhoneValid
                    ? "border-emerald-400 focus:border-emerald-600 focus:bg-white"
                    : "border-slate-200 focus:border-slate-950 focus:bg-white"
                }`}
              />
            </div>

            {phoneError && (
              <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{phoneError}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Send Report on WhatsApp ↗</span>
            </button>

            <Link
              href={`/report?id=${record.id}`}
              target="_blank"
              className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 transition-all text-center cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Preview Clinical Report</span>
            </Link>
          </div>

          {wasSent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
              <span>
                WhatsApp opened! The clinical diagnostic, 6-pillar breakdown, and report link have been pre-filled into the client chat.
              </span>
            </div>
          )}

          {/* Pre-Formatted Message Preview Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMessagePreview(!showMessagePreview)}
              className="text-xs font-bold text-slate-500 hover:text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              {showMessagePreview ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>
                {showMessagePreview
                  ? "Hide WhatsApp Message Preview"
                  : "Preview Pre-Formatted WhatsApp Message"}
              </span>
            </button>

            {showMessagePreview && (
              <div className="mt-2.5 p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {generateWhatsAppMessage()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copy Report Link Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="truncate text-slate-500 font-mono text-[11px] flex-1">
          {reportUrl}
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Recommended Clinical Protocol */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Clinical Protocol</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-white font-sans">
          {record.band.sprintRecommendation}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {record.band.sprintDetails}
        </p>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onReviewAnswers}
          className="text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors cursor-pointer"
        >
          ← Review All Questions
        </button>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-slate-950 hover:text-slate-600 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New Consultation</span>
        </button>
      </div>
    </div>
  );
}
