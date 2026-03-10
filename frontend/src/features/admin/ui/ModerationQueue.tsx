"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getModerationQueue, reviewJob } from "@/entities/moderation/api/moderation.service";
import type { ModerationItem } from "@/entities/moderation/model/types";

export function ModerationQueue() {
  const t = useTranslations("Moderation");
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("FLAGGED");

  const { data, isLoading } = useQuery({
    queryKey: ["moderation-queue", filter],
    queryFn: () => getModerationQueue(filter),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ jobId, action, notes }: { jobId: string; action: "approve" | "reject"; notes: string }) =>
      reviewJob(jobId, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
    },
  });

  const handleReview = (jobId: string, action: "approve" | "reject") => {
    reviewMutation.mutate({ jobId, action, notes: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="gradient-text text-3xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          {["FLAGGED", "PENDING_REVIEW", "BLOCKED", "CLEAN"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === status
                  ? "bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40"
                  : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:border-white/20"
              }`}
            >
              {t(`status.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eab308] border-t-transparent" />
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      )}

      <div className="grid gap-4">
        {data?.items.map((item: ModerationItem) => (
          <div key={item.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      item.moderation_status === "FLAGGED"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : item.moderation_status === "BLOCKED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {item.moderation_status}
                  </span>
                  <span className="text-xs text-slate-600">{item.id.slice(0, 8)}...</span>
                </div>
                <p className="text-[15px] text-white">{item.prompt}</p>
                {item.moderation_notes && (
                  <p className="text-sm text-slate-500">{item.moderation_notes}</p>
                )}
                <p className="text-xs text-slate-600">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>

              {item.video_url && (
                <video
                  src={item.video_url}
                  className="h-24 w-32 rounded-lg object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                />
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleReview(item.id, "approve")}
                  disabled={reviewMutation.isPending}
                  className="rounded-lg bg-green-500/20 px-4 py-2 text-sm text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-50"
                >
                  {t("approve")}
                </button>
                <button
                  onClick={() => handleReview(item.id, "reject")}
                  disabled={reviewMutation.isPending}
                  className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                >
                  {t("reject")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total > data.limit && (
        <p className="text-center text-sm text-slate-500">
          {t("showing", { shown: data.items.length, total: data.total })}
        </p>
      )}
    </div>
  );
}
