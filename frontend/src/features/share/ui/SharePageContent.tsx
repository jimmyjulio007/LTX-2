"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ShareVideo } from "@/entities/gallery/model/types";

interface SharePageContentProps {
  video: ShareVideo;
}

export function SharePageContent({ video }: SharePageContentProps) {
  const t = useTranslations("Share");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Video player */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <video
          src={video.video_url}
          controls
          autoPlay
          loop
          playsInline
          className="w-full"
          style={{ aspectRatio: `${video.width}/${video.height}` }}
        />
      </div>

      {/* Info */}
      <div className="glass-card space-y-4 p-6">
        {video.title && (
          <h1 className="text-2xl font-bold text-white">{video.title}</h1>
        )}

        <div className="flex items-center gap-4">
          {video.creator.image && (
            <img
              src={video.creator.image}
              alt={video.creator.name}
              className="h-10 w-10 rounded-full"
            />
          )}
          <div>
            <p className="text-sm text-slate-400">{t("createdBy")}</p>
            <p className="text-white">{video.creator.name}</p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">{t("prompt")}</p>
          <p className="rounded-lg bg-white/[0.04] p-3 text-sm text-slate-300">{video.prompt}</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>{video.likes_count} likes</span>
          <span>&#183;</span>
          <span>{video.views_count} views</span>
          <span>&#183;</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="btn-ghost rounded-lg px-4 py-2 text-sm"
          >
            {copied ? t("linkCopied") : t("copyLink")}
          </button>
          {video.video_url && (
            <a
              href={video.video_url}
              download
              className="btn-ghost rounded-lg px-4 py-2 text-sm"
            >
              {t("download")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
