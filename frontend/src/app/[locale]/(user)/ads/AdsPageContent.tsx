"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdFactoryWizard } from "@/features/ad-factory/ui/AdFactoryWizard";
import { CampaignCard } from "@/features/ad-factory/ui/CampaignCard";
import {
  useCampaigns,
  useOptimizeCampaign,
} from "@/features/ad-factory/api/use-campaigns";

type Tab = "create" | "campaigns";

export function AdsPageContent() {
  const t = useTranslations("AdFactory");
  const [activeTab, setActiveTab] = useState<Tab>("create");
  const { data: campaigns, isLoading } = useCampaigns();
  const optimizeMutation = useOptimizeCampaign();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          <span className="bg-gradient-to-r from-[#eab308] to-[#facc15] bg-clip-text text-transparent">
            {t("heading")}
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">{t("subheading")}</p>
      </div>

      {/* Tab navigation */}
      <div className="mb-8 flex items-center gap-1 border-b border-white/[0.06] pb-px">
        <button
          onClick={() => setActiveTab("create")}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "create"
              ? "border-b-2 border-[#eab308] text-[#eab308]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tabCreate")}
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "campaigns"
              ? "border-b-2 border-[#eab308] text-[#eab308]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tabCampaigns")}
          {campaigns && campaigns.length > 0 && (
            <span className="ml-2 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
              {campaigns.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "create" && <AdFactoryWizard />}

      {activeTab === "campaigns" && (
        <div>
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="mb-3 h-4 w-2/3 rounded bg-white/[0.06]" />
                  <div className="mb-2 h-3 w-1/2 rounded bg-white/[0.04]" />
                  <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && campaigns && campaigns.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {campaigns.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onOptimize={(id) => optimizeMutation.mutate(id)}
                />
              ))}
            </div>
          )}

          {!isLoading && (!campaigns || campaigns.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
              <svg
                className="mb-4 h-12 w-12 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m10-4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-5 6v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4"
                />
              </svg>
              <p className="mb-1 text-sm font-medium text-white">
                {t("noCampaigns")}
              </p>
              <p className="text-xs text-slate-500">
                {t("noCampaignsHint")}
              </p>
              <button
                onClick={() => setActiveTab("create")}
                className="mt-4 rounded-xl btn-gold px-6 py-2.5 text-xs font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
              >
                {t("createFirst")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
