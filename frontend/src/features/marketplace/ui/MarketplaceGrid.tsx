"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useMarketplaceTemplates,
  usePurchaseTemplate,
} from "../api/use-marketplace";
import { MarketplaceCard } from "./MarketplaceCard";

const CATEGORIES = [
  "all",
  "marketing",
  "social",
  "cinematic",
  "product",
  "educational",
  "music",
] as const;

interface MarketplaceGridProps {
  locale: string;
}

export function MarketplaceGrid({ locale }: MarketplaceGridProps) {
  const t = useTranslations("Marketplace");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMarketplaceTemplates({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    page,
    limit: 12,
  });

  const purchaseMutation = usePurchaseTemplate();

  const templates = data?.templates ?? [];
  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat
                ? "bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/30"
                : "border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
            }`}
          >
            {t(`category_${cat}`)}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-white/[0.04]" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
                <div className="h-3 w-full rounded bg-white/[0.04]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template grid */}
      {!isLoading && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <MarketplaceCard
              key={template.id}
              template={template}
              locale={locale}
              onPurchase={(id) => purchaseMutation.mutate(id)}
              isPurchasing={purchaseMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-sm text-slate-500">{t("noTemplates")}</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("prev")}
          </button>

          <span className="px-3 text-xs text-slate-500">
            {t("pageOf", { current: page, total: totalPages })}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
