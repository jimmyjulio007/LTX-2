"use client";

import { useTranslations } from "next-intl";
import { useDeleteAvatar } from "../api/use-avatars";
import type { Avatar } from "@/entities/video-job/model/types";

interface AvatarCardProps {
  avatar: Avatar;
  onSchedule: (avatarId: string) => void;
}

export function AvatarCard({ avatar, onSchedule }: AvatarCardProps) {
  const t = useTranslations("Avatar");
  const deleteMutation = useDeleteAvatar();

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3 transition-all hover:border-[#eab308]/20">
      {/* Avatar header */}
      <div className="flex items-start gap-3">
        {avatar.profile_image_url ? (
          <img
            src={avatar.profile_image_url}
            alt={avatar.name}
            className="h-10 w-10 rounded-full border border-white/[0.08] object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eab308]/20 text-sm font-bold text-[#eab308]">
            {avatar.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{avatar.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{avatar.style_prompt}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="text-xs text-slate-600">
        {t("created")}: {new Date(avatar.created_at).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSchedule(avatar.id)}
          className="btn-gold flex-1 px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          {t("schedule")}
        </button>
        <button
          onClick={() => deleteMutation.mutate(avatar.id)}
          disabled={deleteMutation.isPending}
          className="rounded-lg border border-white/[0.06] p-2.5 text-slate-500 transition-colors hover:border-red-500/30 hover:text-red-400 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
