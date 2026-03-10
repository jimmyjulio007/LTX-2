"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useReferralStats } from "../api/use-referral";

export function ReferralWidget() {
  const t = useTranslations("Referral");
  const { data: stats, isLoading } = useReferralStats();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!stats?.referral_code) return;
    const url = `${window.location.origin}?ref=${stats.referral_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return null;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">{t("title")}</h3>
        <span className="text-xs text-[#eab308]">{t("reward")}</span>
      </div>

      <p className="text-xs text-slate-500">{t("description")}</p>

      {/* Referral code */}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-lg bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-[#eab308] border border-white/[0.08]">
          {stats?.referral_code || "..."}
        </div>
        <button
          onClick={handleCopy}
          className="rounded-lg bg-[#eab308]/20 px-4 py-2.5 text-sm text-[#eab308] transition-colors hover:bg-[#eab308]/30"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-white">{stats?.completed_referrals ?? 0}</p>
          <p className="text-xs text-slate-500">{t("referred")}</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-[#eab308]">{stats?.total_credits_earned ?? 0}</p>
          <p className="text-xs text-slate-500">{t("creditsEarned")}</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-white">
            {stats ? stats.max_referrals - stats.total_referrals : 0}
          </p>
          <p className="text-xs text-slate-500">{t("remaining")}</p>
        </div>
      </div>
    </div>
  );
}
