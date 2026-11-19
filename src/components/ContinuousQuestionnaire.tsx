"use client";

import React, { useState, useMemo } from "react";
import {
  AUDIT_SECTIONS,
  ClientDetails,
  NUTRITIONAL_TARGETS,
  DIET_PREFERENCES,
  calculateBmi,
  convertFtInToCm,
  convertCmToFtIn,
  getScoreBand,
  getImprovementVectors,
  SAMPLE_AUDIT,
} from "@/lib/audit-data";
import {
  Check,
  ArrowRight,
  Phone,
  Send,
  X,
  ShieldAlert,
  User,
  Scale,
  Sparkles,
  Utensils,
  Coffee,
  Calendar,
  Moon,
  HeartPulse,
  Target,
  ChevronDown,
  RotateCcw,
  Sparkle,
} from "lucide-react";

interface ContinuousQuestionnaireProps {
  business: ClientDetails;
  onBusinessChange: (fields: Partial<ClientDetails>) => void;
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
  onGenerateReport: () => void;
  currentScore: number;
  onLoadSampleClient?: () => void;
}

const PILLAR_META: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    lightBg: string;
    borderCol: string;
    subtitle: string;
  }
> = {
  protein: {
    icon: Utensils,
    color: "#10B981", // Emerald
    lightBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    borderCol: "border-emerald-500",
    subtitle: "Daily protein density, meal distribution & post-meal satiety window.",
  },
  liquid_sugar: {
    icon: Coffee,
    color: "#F59E0B", // Amber
    lightBg: "bg-amber-50 text-amber-800 border-amber-200",
    borderCol: "border-amber-500",
    subtitle: "Daily chai/coffee sugar, smoothies/juices & 5 PM refined snacking leaks.",
  },
  weekend_social: {
    icon: Calendar,
    color: "#8B5CF6", // Purple
    lightBg: "bg-purple-50 text-purple-700 border-purple-200",
    borderCol: "border-purple-500",
    subtitle: "Friday–Sunday eating drift, restaurant dining, alcohol & Monday crash detoxes.",
  },
  gut_digestion: {
    icon: ShieldAlert,
    color: "#EF4444", // Rose
    lightBg: "bg-rose-50 text-rose-700 border-rose-200",
    borderCol: "border-rose-500",
    subtitle: "Post-meal bloating, acid reflux, bowel transit & daily probiotic fiber intake.",
  },
  cravings_stress: {
    icon: Moon,
    color: "#EC4899", // Pink
    lightBg: "bg-pink-50 text-pink-700 border-pink-200",
    borderCol: "border-pink-500",
    subtitle: "Post-dinner meetha cravings, cortisol stress eating & late night screen grazing.",
  },
  hormonal_energy: {
    icon: HeartPulse,
    color: "#0284C7", // Sky
    lightBg: "bg-sky-50 text-sky-700 border-sky-200",
    borderCol: "border-sky-500",
    subtitle: "Diagnosed metabolic markers, post-lunch energy crashes & crash diet rebound.",
  },
};

export function ContinuousQuestionnaire({
  business,
  onBusinessChange,
  answers,
  onAnswer,
  onGenerateReport,
  currentScore,
  onLoadSampleClient,
}: ContinuousQuestionnaireProps) {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [modalPhone, setModalPhone] = useState(
    business.whatsappNumber || business.phone || ""
  );
  const [phoneError, setPhoneError] = useState("");

  const answeredCount = Object.keys(answers).length;
  let globalQuestionCounter = 1;

  // Height unit & calculations
  const heightUnit = business.heightUnit || "cm";

  // Calculate live BMI, healthy ranges, weight gap, and protein needs
  const bmiData = useMemo(() => {
    return calculateBmi(
      business.heightCm || "",
      business.weightKg || "",
      business.targetWeightKg || ""
    );
  }, [business.heightCm, business.weightKg, business.targetWeightKg]);

  // Compute live section scores for real-time diagnostic
  const liveSectionScores = useMemo(() => {
    return AUDIT_SECTIONS.map((sec) => {
      let score = 0;
      sec.questions.forEach((q) => {
        const chosen = answers[q.id];
        if (chosen !== undefined && q.options[chosen]) {
          score += q.options[chosen].points;
        }
      });
      return {
        id: sec.id,
        name: sec.shortName,
        fullName: sec.name,
        score,
        maxScore: sec.maxPoints,
      };
    });
  }, [answers]);

  const scoreBand = useMemo(() => getScoreBand(currentScore), [currentScore]);

  // Diagnosis & improvement vectors
  const diagnosisData = useMemo(() => {
    const formattedScores = liveSectionScores.map((s) => ({
      id: s.id,
      name: s.fullName,
      shortName: s.name,
      icon: "",
      score: s.score,
      maxScore: s.maxScore,
      percentage: Math.round((s.score / s.maxScore) * 100),
    }));
    return getImprovementVectors(formattedScores);
  }, [liveSectionScores]);

  // Height unit toggling
  const handleToggleHeightUnit = (newUnit: "cm" | "ft") => {
    if (newUnit === heightUnit) return;
    if (newUnit === "ft" && business.heightCm) {
      const { feet, inches } = convertCmToFtIn(parseFloat(business.heightCm));
      onBusinessChange({
        heightUnit: "ft",
        heightFt: feet.toString(),
        heightIn: inches.toString(),
      });
    } else if (newUnit === "cm" && business.heightFt) {
      const cmVal = convertFtInToCm(
        parseInt(business.heightFt || "0", 10),
        parseInt(business.heightIn || "0", 10)
      );
      onBusinessChange({
        heightUnit: "cm",
        heightCm: cmVal.toString(),
      });
    } else {
      onBusinessChange({ heightUnit: newUnit });
    }
  };

  const handleHeightFtInChange = (feetStr: string, inchStr: string) => {
    const feet = parseInt(feetStr || "0", 10);
    const inches = parseInt(inchStr || "0", 10);
    const cmVal = convertFtInToCm(feet, inches);
    onBusinessChange({
      heightFt: feetStr,
      heightIn: inchStr,
      heightCm: cmVal > 0 ? cmVal.toString() : "",
    });
  };

  const handleGenerateClick = () => {
    if (!business.name.trim()) {
      alert("Please enter the Client's Full Name before generating the clinical report.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const currentPhone = (business.whatsappNumber || business.phone || "").trim();
    if (!currentPhone) {
      setModalPhone("");
      setPhoneError("");
      setShowPhoneModal(true);
      return;
    }

    onGenerateReport();
  };

  const handleConfirmModalPhone = (skip = false) => {
    if (!skip) {
      const digits = modalPhone.replace(/\D/g, "");
      if (digits.length !== 10 && digits.length !== 12) {
        setPhoneError("Please enter a valid 10-digit Indian WhatsApp mobile number.");
        return;
      }
      onBusinessChange({
        whatsappNumber: modalPhone,
        phone: modalPhone,
      });
    }
    setShowPhoneModal(false);
    onGenerateReport();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-32">
      {/* Top Application Header */}
      <div className="pt-2 pb-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs tracking-wider shadow-sm flex items-center justify-center font-mono shrink-0">
              RN
            </div>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Rethink Nutrition
            </span>
          </div>

          {/* Quick Load Sample Client Button */}
          {onLoadSampleClient && (
            <button
              type="button"
              onClick={onLoadSampleClient}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all cursor-pointer"
              title="Load Priya Sharma (Sample Client Intake)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Sample Client (Priya Sharma)</span>
            </button>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 font-sans tracking-tight">
            Clinical Diet Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Nutritional Deficit, Gut Health & Metabolic Rate Diagnostic
          </p>
        </div>
      </div>

      {/* Phase 01: Client Profile, Goals & Biometrics Card */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-white mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Phase 01: Client Profile, Goals & Biometrics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-sans tracking-tight">
            Clinical Diet Consultation Intake
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Enter physical biometrics, primary nutritional targets & diet preferences for live metabolic calibration.
          </p>
        </div>

        {/* Client Profile Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Client Full Name */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Client Full Name *</span>
            </label>
            <input
              type="text"
              value={business.name}
              onChange={(e) =>
                onBusinessChange({ name: e.target.value, clientName: e.target.value })
              }
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs"
            />
          </div>

          {/* WhatsApp / Phone */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>WhatsApp / Phone</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1-tap share</span>
            </label>
            <input
              type="tel"
              value={business.whatsappNumber || business.phone || ""}
              onChange={(e) =>
                onBusinessChange({
                  whatsappNumber: e.target.value,
                  phone: e.target.value,
                })
              }
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
            />
          </div>

          {/* Age & Biological Sex */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Age & Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="10"
                max="100"
                value={business.age || ""}
                onChange={(e) => onBusinessChange({ age: e.target.value })}
                placeholder="Age (e.g. 34)"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
              />
              <select
                value={business.biologicalSex || "Female"}
                onChange={(e) =>
                  onBusinessChange({
                    biologicalSex: e.target.value as "Female" | "Male",
                  })
                }
                className="w-full px-2.5 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-semibold text-slate-950 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs cursor-pointer"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>
        </div>

        {/* Primary Nutritional Target & Diet Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Primary Nutritional Target */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="nutritional-target-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Nutritional Target *</span>
              </label>
            </div>

            <div className="relative">
              <select
                id="nutritional-target-select"
                value={business.category || "Drop Visceral Belly Fat & Lose 8-12 kg"}
                onChange={(e) =>
                  onBusinessChange({ category: e.target.value, goal: e.target.value })
                }
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-bold text-slate-950 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs cursor-pointer"
              >
                {NUTRITIONAL_TARGETS.map((target) => (
                  <option
                    key={target.name}
                    value={target.name}
                    className="py-2 text-slate-900 font-semibold"
                  >
                    {target.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {NUTRITIONAL_TARGETS.find(
                (g) =>
                  g.name ===
                  (business.category || "Drop Visceral Belly Fat & Lose 8-12 kg")
              )?.subtitle}
            </p>
          </div>

          {/* Diet Preference */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="diet-preference-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <Utensils className="w-3.5 h-3.5 text-slate-400" />
                <span>Diet Preference *</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Macro Calibration
              </span>
            </div>

            <div className="relative">
              <select
                id="diet-preference-select"
                value={business.dietPreference || "Vegetarian (Dairy)"}
                onChange={(e) =>
                  onBusinessChange({ dietPreference: e.target.value })
                }
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 text-base sm:text-sm font-bold text-slate-950 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs cursor-pointer"
              >
                {DIET_PREFERENCES.map((pref) => (
                  <option
                    key={pref}
                    value={pref}
                    className="py-2 text-slate-900 font-semibold"
                  >
                    {pref}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Daily protein sources calibrated to your dietary baseline.
            </p>
          </div>
        </div>

        {/* Biometrics Input Section (Height, Current Weight & Target Weight) */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-400" />
              <span>Biometrics & Body Status</span>
            </span>

            {/* Height Unit Toggle Switch */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => handleToggleHeightUnit("cm")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  heightUnit === "cm"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => handleToggleHeightUnit("ft")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  heightUnit === "ft"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ft / in
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Height Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Height {heightUnit === "cm" ? "(cm)" : "(ft / in)"}
              </label>

              {heightUnit === "cm" ? (
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="50"
                    max="250"
                    value={business.heightCm || ""}
                    onChange={(e) => onBusinessChange({ heightCm: e.target.value })}
                    placeholder="e.g. 162"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
                  />
                  <span className="absolute right-3.5 text-xs font-mono text-slate-400 font-bold pointer-events-none">
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={business.heightFt || ""}
                      onChange={(e) =>
                        handleHeightFtInChange(e.target.value, business.heightIn || "0")
                      }
                      placeholder="e.g. 5"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
                    />
                    <span className="absolute right-3 text-xs font-mono text-slate-400 font-bold pointer-events-none">
                      ft
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={business.heightIn || ""}
                      onChange={(e) =>
                        handleHeightFtInChange(business.heightFt || "5", e.target.value)
                      }
                      placeholder="e.g. 4"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
                    />
                    <span className="absolute right-3 text-xs font-mono text-slate-400 font-bold pointer-events-none">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Body Weight */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Wt (kg)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={business.weightKg || ""}
                  onChange={(e) => onBusinessChange({ weightKg: e.target.value })}
                  placeholder="e.g. 76"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
                />
                <span className="absolute right-3.5 text-xs font-mono text-slate-400 font-bold pointer-events-none">
                  kg
                </span>
              </div>
            </div>

            {/* Target Weight */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Wt (kg)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="200"
                  value={business.targetWeightKg || ""}
                  onChange={(e) => onBusinessChange({ targetWeightKg: e.target.value })}
                  placeholder="e.g. 60"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all shadow-xs font-mono"
                />
                <span className="absolute right-3.5 text-xs font-mono text-slate-400 font-bold pointer-events-none">
                  kg
                </span>
              </div>
            </div>
          </div>

          {/* Live Body Status Strip: Healthy Range, BMI, Weight Gap, Protein Need */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Live Body Status
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                    {bmiData ? bmiData.formattedBmi : "--.-"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Live BMI</span>

                  {bmiData ? (
                    <span
                      className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border font-mono"
                      style={{
                        color: bmiData.categoryColor,
                        borderColor: `${bmiData.categoryColor}40`,
                        backgroundColor: `${bmiData.categoryColor}15`,
                      }}
                    >
                      {bmiData.category}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono italic">
                      Enter Height & Weight
                    </span>
                  )}
                </div>
              </div>

              {/* Healthy Target Range */}
              <div className="sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Healthy Target Range
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400">
                  {bmiData ? bmiData.healthyRangeText : "Healthy: -- - -- kg"}
                </span>
              </div>
            </div>

            {/* 3 Metric Pills: Weight Gap, Protein Need, Healthy Range */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Weight Gap
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-amber-400 mt-0.5 block">
                  {bmiData ? bmiData.weightGapText : "-- kg"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Difference to Target
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Protein Need
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5 block">
                  {bmiData ? bmiData.proteinNeedText : "--g / day"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  1.2g - 1.5g / kg Target
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Dietary Baseline
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 block truncate">
                  {business.dietPreference || "Vegetarian (Dairy)"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Active Nutritional Split
                </span>
              </div>
            </div>

            {bmiData && (
              <p className="text-[11px] text-slate-300 font-mono text-center pt-0.5">
                {bmiData.summary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Live Total Lifestyle Score & Diagnostic Card */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              Nutritional & Metabolic Health Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {currentScore}
              </span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border font-mono ${scoreBand.badgeClass}`}
              >
                {scoreBand.title}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            <span>Intake Completed: </span>
            <strong className="text-white">{answeredCount}</strong> / 18 questions
          </div>
        </div>

        {/* 6 Pillars Score Breakdown Grid */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
            6-Pillar Nutritional Breakdown
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {liveSectionScores.map((sec, idx) => (
              <div
                key={sec.id}
                className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">P{idx + 1}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        sec.score >= Math.round(sec.maxScore * 0.7)
                          ? "#10B981"
                          : sec.score >= Math.round(sec.maxScore * 0.4)
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-200 mt-1 truncate">
                  {sec.name}
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-black font-mono text-white">
                    {sec.score}
                    <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                      /{sec.maxScore}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnosis & Improvement Vectors */}
        <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Diagnosis & Clinical Improvement Vectors</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-extrabold text-white font-sans">
              {diagnosisData.headline}
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-normal">
              {scoreBand.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Recommended Clinical Protocol:
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {scoreBand.sprintRecommendation}
            </span>
          </div>
        </div>
      </section>

      {/* 6 Nutrition Pillars & 18 Clinical Questions */}
      <div className="space-y-12">
        {AUDIT_SECTIONS.map((section, sIdx) => {
          const meta = PILLAR_META[section.id] || {
            icon: Sparkles,
            color: "#10B981",
            lightBg: "bg-emerald-50 text-emerald-700",
            borderCol: "border-emerald-500",
            subtitle: "",
          };
          const PillarIcon = meta.icon;

          return (
            <div key={section.id} className="space-y-5">
              {/* Pillar Section Header */}
              <div className="pt-6 pb-3 border-b border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: meta.color }}
                    >
                      <PillarIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Section {sIdx + 1}: Pillar {sIdx + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      · {section.questions.length} Questions
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 shrink-0">
                    {section.maxPoints} pts max
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight font-sans">
                  {section.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 leading-normal font-normal">
                  {meta.subtitle}
                </p>
              </div>

              {/* Questions in this Section */}
              <div className="space-y-5">
                {section.questions.map((q) => {
                  const qNum = globalQuestionCounter++;
                  const chosenOptIndex = answers[q.id];
                  const isAnswered = chosenOptIndex !== undefined;

                  return (
                    <article
                      key={q.id}
                      id={`question-${qNum}`}
                      className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-sm scroll-mt-24 ${
                        isAnswered
                          ? "border-slate-300 ring-1 ring-slate-200"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Meta Line: Question Number & Points */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            Question {q.numberStr} (0{qNum} of 18)
                          </span>
                        </div>

                        {/* Status Check / Points Pill */}
                        <div className="shrink-0 text-right">
                          {isAnswered ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span>Awarded: +{q.options[chosenOptIndex].points} pts</span>
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-semibold text-slate-400">
                              Max: +{Math.max(...q.options.map((o) => o.points))} pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Title */}
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug font-sans mt-2">
                        {q.text}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed mt-1.5 mb-5 font-normal">
                        {q.description}
                      </p>

                      {/* Options List */}
                      <div className="space-y-2.5">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosenOptIndex === optIdx;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                onAnswer(q.id, optIdx);
                                if (qNum < 18) {
                                  setTimeout(() => {
                                    const nextEl = document.getElementById(
                                      `question-${qNum + 1}`
                                    );
                                    if (nextEl) {
                                      nextEl.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }
                                  }, 150);
                                }
                              }}
                              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                                  : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/90 text-slate-900"
                              }`}
                            >
                              {/* Check / Radio indicator */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <span
                                    className={`text-sm sm:text-[15px] font-bold leading-snug tracking-tight ${
                                      isSelected
                                        ? "text-emerald-950"
                                        : "text-slate-950"
                                    }`}
                                  >
                                    {opt.text}
                                  </span>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {opt.badge && (
                                      <span
                                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                          isSelected
                                            ? "bg-emerald-200/70 text-emerald-900"
                                            : "bg-slate-200/70 text-slate-700"
                                        }`}
                                      >
                                        {opt.badge}
                                      </span>
                                    )}
                                    <span
                                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                        isSelected
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80"
                                          : "bg-slate-200/80 text-slate-700 border border-slate-200"
                                      }`}
                                    >
                                      {opt.points > 0 ? `+${opt.points}` : "0"}
                                    </span>
                                  </div>
                                </div>

                                {opt.hint && (
                                  <p
                                    className={`text-xs sm:text-[12.5px] mt-1.5 leading-relaxed ${
                                      isSelected
                                        ? "text-emerald-900/90 font-medium"
                                        : "text-slate-600 font-normal"
                                    }`}
                                  >
                                    {opt.hint}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 text-white border-t border-slate-800/90 p-3.5 sm:p-4 backdrop-blur-md shadow-2xl no-print">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block leading-none">
              Metabolic Index
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white leading-none">
                {currentScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold font-mono">/100</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateClick}
            className="flex-1 max-w-xs px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer font-sans"
          >
            <span>Generate Clinical Report</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Client WhatsApp Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overscroll-none animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 font-sans tracking-tight">
                    Client's WhatsApp Number
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Deliver direct clinical diet report to client
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPhoneModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
              Enter the client's WhatsApp number to deliver their personalized clinical diet intake and metabolic reset protocol directly to their phone.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                10-Digit Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-slate-700 font-mono text-xs font-bold border-r border-slate-200 pr-2.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  autoFocus
                  value={modalPhone}
                  onChange={(e) => {
                    setModalPhone(e.target.value);
                    setPhoneError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmModalPhone(false);
                    }
                  }}
                  placeholder="9876543210"
                  className="w-full pl-20 pr-4 py-3.5 rounded-xl border border-slate-250 bg-slate-50 text-base sm:text-sm font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-colors shadow-xs font-mono"
                />
              </div>

              {phoneError && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmModalPhone(false)}
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-950 hover:bg-black active:bg-slate-900 text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer font-sans"
              >
                <span>Continue to Summary & Share</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => handleConfirmModalPhone(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors cursor-pointer text-center"
              >
                Skip for now (enter on summary page)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
