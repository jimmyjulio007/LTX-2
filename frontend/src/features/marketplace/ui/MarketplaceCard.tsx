"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MarketplaceTemplate } from "@/entities/video-job/model/types";

interface MarketplaceCardProps {
  template: MarketplaceTemplate;
  locale: string;
  onPurchase?: (templateId: string) => void;
  isPurchasing?: boolean;
}

export function MarketplaceCard({
  template,
  locale,
  onPurchase,
  isPurchasing,
}: MarketplaceCardProps) {
  const t = useTranslations("Marketplace");

  const displayName =
    locale === "fr" && template.name_fr ? template.name_fr : template.name;
  const displayDescription =
    locale === "fr" && template.description_fr
      ? template.description_fr
      : template.description;

  return (
    <div className="glass-card group overflow-hidden transition-all hover:border-[#eab308]/20">
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video overflow-hidden">
        {template.preview_video_url ? (
          <video
            src={template.preview_video_url}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
            onMouseLeave={(e) => {
              const el = e.target as HTMLVideoElement;
              el.pause();
              el.currentTime = 0;
            }}
          />
        ) : template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/[0.02]">
            <svg
              className="h-8 w-8 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 backdrop-blur-sm">
            {template.category}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <span className="rounded-md bg-[#eab308]/90 px-2 py-0.5 text-[10px] font-bold text-black">
            {template.price_credits} {t("credits")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="mb-1 text-sm font-medium text-white">{displayName}</h3>
        <p className="mb-3 line-clamp-2 text-xs text-slate-500">
          {displayDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span>
              {template.total_sales} {t("sales")}
            </span>
          </div>

          {onPurchase && (
            <button
              onClick={() => onPurchase(template.id)}
              disabled={isPurchasing}
              className="rounded-lg bg-[#eab308]/10 px-3 py-1.5 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPurchasing ? t("purchasing") : t("useTemplate")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
