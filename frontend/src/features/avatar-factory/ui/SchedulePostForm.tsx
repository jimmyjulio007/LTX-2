"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSchedulePost } from "../api/use-avatars";

interface SchedulePostFormProps {
  avatarId: string;
  onClose?: () => void;
}

const PLATFORMS = ["youtube", "tiktok", "instagram", "twitter", "linkedin"];

export function SchedulePostForm({ avatarId, onClose }: SchedulePostFormProps) {
  const t = useTranslations("Avatar");
  const scheduleMutation = useSchedulePost();

  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !scheduledAt) return;

    await scheduleMutation.mutateAsync({
      avatar_id: avatarId,
      prompt: prompt.trim(),
      platform,
      scheduled_at: new Date(scheduledAt).toISOString(),
    });

    setPrompt("");
    setScheduledAt("");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="mx-4 w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 space-y-5"
      >
        <h3 className="text-lg font-semibold text-white">{t("schedulePost")}</h3>

        {/* Prompt */}
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t("postPrompt")}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("postPromptPlaceholder")}
            rows={4}
            className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
          />
        </div>

        {/* Platform select */}
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t("platform")}</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#eab308]/40 cursor-pointer"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#0a0a0a] capitalize">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Datetime picker */}
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t("scheduleDate")}</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#eab308]/40"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("cancel")}
            </button>
          )}
          <button
            type="submit"
            disabled={scheduleMutation.isPending || !prompt.trim() || !scheduledAt}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {scheduleMutation.isPending ? t("scheduling") : t("schedule")}
          </button>
        </div>

        {scheduleMutation.isError && (
          <p className="text-sm text-red-400">{t("scheduleError")}</p>
        )}
      </form>
    </div>
  );
}
