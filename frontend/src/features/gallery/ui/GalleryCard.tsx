"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useToggleLike } from "../api/use-gallery";
import type { GalleryVideo } from "@/entities/gallery/model/types";

import { PublishVideoButton } from "../../social/ui/PublishVideoButton";

interface GalleryCardProps {
  video: GalleryVideo;
  locale: string;
  currentUserId?: string;
}

export function GalleryCard({ video, locale, currentUserId }: GalleryCardProps) {
  const t = useTranslations("Gallery");
  const likeMutation = useToggleLike();

  return (
    <div className="glass-card group overflow-hidden transition-all hover:border-[#eab308]/20">
      {/* Video thumbnail / preview */}
      <Link href={`/v/${video.share_id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          {video.thumbnail_url ? (
            <Image
              src={video.thumbnail_url}
              alt={video.title || video.prompt.slice(0, 50)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : video.video_url ? (
            <video
              src={video.video_url}
              className="h-full w-full object-cover"
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
          ) : (
            <div className="flex h-full items-center justify-center bg-white/[0.02]">
              <span className="text-slate-600">No preview</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="line-clamp-2 text-sm text-slate-300">{video.title || video.prompt.slice(0, 100)}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <button
              onClick={() => likeMutation.mutate(video.id)}
              disabled={likeMutation.isPending}
              className="flex items-center gap-1 transition-colors hover:text-[#eab308]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {video.likes_count}
            </button>

            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {video.views_count}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUserId === video.user_id && (
              <PublishVideoButton jobId={video.id} />
            )}
            <Link
              href={`/v/${video.share_id}`}
              className="text-xs text-[#eab308]/60 transition-colors hover:text-[#eab308]"
            >
              {t("remix")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
