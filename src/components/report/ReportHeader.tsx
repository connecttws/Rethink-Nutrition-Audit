"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Printer, Share2, Check, ArrowLeft, MessageSquare } from "lucide-react";
import { AuditRecord } from "@/lib/audit-data";

interface ReportHeaderProps {
  record: AuditRecord;
}

export function ReportHeader({ record }: ReportHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shortUrl = `${origin}/r/${record.id}`;
    const text =
      `*RN • Rethink Nutrition • Clinical Diet & Metabolic Diagnostic*\n` +
      `*Client:* ${record.business.name}\n` +
      `*Metabolic Score:* ${record.totalScore} / 100 (${record.band.title})\n\n` +
      `View your complete clinical diet & metabolic report: ${shortUrl}\n\n` +
      `_Prepared by Rethink Clinical Nutrition Team._`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCopyLink = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const shortUrl = `${origin}/r/${record.id}`;
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Please copy the URL from your browser address bar.");
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 text-slate-900 border-b border-slate-200/90 shadow-xs backdrop-blur-md no-print">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand & Reference */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            title="Back to Clinical Intake"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs tracking-wider shadow-sm shrink-0 flex items-center justify-center font-mono">
              RN
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-black text-xs sm:text-sm tracking-tight text-slate-900 truncate">
                  Rethink Nutrition
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-700 truncate">
                  {record.business.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                Clinical Diet & Metabolic Diagnostic · Ref: {record.id}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save PDF</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-slate-950 transition-colors shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
}
