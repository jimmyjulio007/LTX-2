"use client";

import { useTranslations } from "next-intl";
import type { GallerySortOption } from "@/entities/gallery/model/types";

interface GalleryFiltersProps {
  sort: GallerySortOption;
  onSortChange: (sort: GallerySortOption) => void;
}

const SORT_OPTIONS: GallerySortOption[] = ["recent", "popular", "likes"];

export function GalleryFilters({ sort, onSortChange }: GalleryFiltersProps) {
  const t = useTranslations("Gallery");

  const sortLabels: Record<GallerySortOption, string> = {
    recent: t("filterRecent"),
    popular: t("filterPopular"),
    likes: t("filterLikes"),
  };

  return (
    <div className="flex gap-2">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onSortChange(option)}
          className={`rounded-lg px-4 py-2 text-sm transition-colors ${
            sort === option
              ? "bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40"
              : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:border-white/20"
          }`}
        >
          {sortLabels[option]}
        </button>
      ))}
    </div>
  );
}
