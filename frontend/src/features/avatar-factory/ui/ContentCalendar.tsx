"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCalendar } from "../api/use-avatars";
import type { ScheduledPost } from "@/entities/video-job/model/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_DOT: Record<string, string> = {
  scheduled: "bg-[#eab308]",
  published: "bg-emerald-500",
  failed: "bg-red-500",
  pending: "bg-sky-500",
};

function getWeekDates(weekOffset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function ContentCalendar() {
  const t = useTranslations("Avatar");
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: posts, isLoading } = useCalendar(weekOffset);

  const weekDates = getWeekDates(weekOffset);

  // Group posts by date
  const postsByDate = new Map<string, ScheduledPost[]>();
  posts?.forEach((post) => {
    const dateKey = new Date(post.scheduled_at).toISOString().split("T")[0];
    const existing = postsByDate.get(dateKey) ?? [];
    postsByDate.set(dateKey, [...existing, post]);
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("calendar")}</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t("prevWeek")}
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t("today")}
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white cursor-pointer"
          >
            {t("nextWeek")}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white/[0.02] p-3 h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const dateKey = date.toISOString().split("T")[0];
            const dayPosts = postsByDate.get(dateKey) ?? [];
            const isToday = dateKey === today;

            return (
              <div
                key={i}
                className={`min-h-[120px] rounded-xl border p-3 space-y-2 ${
                  isToday
                    ? "border-[#eab308]/30 bg-[#eab308]/[0.03]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase text-slate-500">
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isToday ? "text-[#eab308]" : "text-slate-400"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-lg bg-white/[0.04] p-2 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          STATUS_DOT[post.status] ?? "bg-slate-500"
                        }`}
                      />
                      <span className="text-[10px] text-slate-400">{post.platform}</span>
                    </div>
                    <p className="line-clamp-2 text-[10px] leading-tight text-white">
                      {post.prompt}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
