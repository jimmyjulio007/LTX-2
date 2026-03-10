"use client";

import { useTranslations } from "next-intl";
import type { AdPerformance } from "@/entities/video-job/model/types";

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "generating" | "active" | "paused" | "completed";
  target_platform: string;
  variation_count: number;
  best_performer?: AdPerformance;
  created_at: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onOptimize?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400",
  generating: "bg-blue-500/20 text-blue-400",
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  completed: "bg-white/10 text-slate-300",
};

export function CampaignCard({ campaign, onOptimize }: CampaignCardProps) {
  const t = useTranslations("AdFactory");

  return (
    <div className="glass-card group overflow-hidden p-5 transition-all hover:border-[#eab308]/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-medium text-white">
            {campaign.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {campaign.target_platform}
          </p>
        </div>
        <span
          className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft
          }`}
        >
          {t(`status_${campaign.status}`)}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>
            {campaign.variation_count} {t("variationsLabel")}
          </span>
        </div>

        <span className="text-xs text-slate-600">
          {new Date(campaign.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Best performer */}
      {campaign.best_performer && (
        <div className="mb-4 rounded-lg border border-[#eab308]/10 bg-[#eab308]/[0.04] px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <svg
              className="h-3 w-3 text-[#eab308]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#eab308]">
              {t("bestPerformer")}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              CTR: {(campaign.best_performer.ctr * 100).toFixed(1)}%
            </span>
            <span>
              {campaign.best_performer.conversions} {t("conversions")}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      {campaign.status === "active" && onOptimize && (
        <button
          onClick={() => onOptimize(campaign.id)}
          className="w-full rounded-lg bg-[#eab308]/10 px-3 py-2 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20"
        >
          {t("optimize")}
        </button>
      )}
    </div>
  );
}
