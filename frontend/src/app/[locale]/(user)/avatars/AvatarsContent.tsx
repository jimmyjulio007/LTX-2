"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAvatars } from "@/features/avatar-factory/api/use-avatars";
import { AvatarCard } from "@/features/avatar-factory/ui/AvatarCard";
import { AvatarCreator } from "@/features/avatar-factory/ui/AvatarCreator";
import { ContentCalendar } from "@/features/avatar-factory/ui/ContentCalendar";
import { SchedulePostForm } from "@/features/avatar-factory/ui/SchedulePostForm";

export function AvatarsContent() {
  const t = useTranslations("Avatar");
  const { data: avatars, isLoading } = useAvatars();
  const [showCreator, setShowCreator] = useState(false);
  const [schedulingAvatarId, setSchedulingAvatarId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {avatars?.length ?? 0} {t("avatarsCount")}
        </p>
        <button
          onClick={() => setShowCreator(true)}
          className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          {t("createNew")}
        </button>
      </div>

      {/* Avatar creator */}
      {showCreator && <AvatarCreator onClose={() => setShowCreator(false)} />}

      {/* Avatar list */}
      {avatars && avatars.length === 0 && !showCreator && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-slate-500">{t("noAvatars")}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {avatars?.map((avatar) => (
          <AvatarCard
            key={avatar.id}
            avatar={avatar}
            onSchedule={(id) => setSchedulingAvatarId(id)}
          />
        ))}
      </div>

      {/* Content calendar */}
      <ContentCalendar />

      {/* Schedule post modal */}
      {schedulingAvatarId && (
        <SchedulePostForm
          avatarId={schedulingAvatarId}
          onClose={() => setSchedulingAvatarId(null)}
        />
      )}
    </div>
  );
}
