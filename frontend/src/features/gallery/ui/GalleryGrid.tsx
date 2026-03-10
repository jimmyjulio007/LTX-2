"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useGalleryVideos } from "../api/use-gallery";
import { GalleryCard } from "./GalleryCard";
import { useSession } from "@/shared/lib/auth-client";
import { GalleryFilters } from "./GalleryFilters";
import type { GallerySortOption } from "@/entities/gallery/model/types";

export function GalleryGrid() {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const [sort, setSort] = useState<GallerySortOption>("recent");
  const { data: session } = useSession();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useGalleryVideos(sort);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const allVideos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-8">
      <GalleryFilters sort={sort} onSortChange={setSort} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eab308] border-t-transparent" />
        </div>
      ) : allVideos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-500">{t("noResults")}</p>
        </div>
      ) : (
        <>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {allVideos.map((video) => (
              <div key={video.id} className="mb-4 break-inside-avoid">
                <GalleryCard 
                  video={video} 
                  locale={locale} 
                  currentUserId={session?.user.id}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#eab308] border-t-transparent" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
