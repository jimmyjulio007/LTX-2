"use client";

import { useTranslations } from "next-intl";
import { useDeleteLoraModel } from "../api/use-lora";
import type { LoraModel } from "@/entities/video-job/model/types";

interface LoraModelCardProps {
  model: LoraModel;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  TRAINING: "bg-sky-500/20 text-sky-400",
  READY: "bg-emerald-500/20 text-emerald-400",
  FAILED: "bg-red-500/20 text-red-400",
};

export function LoraModelCard({ model }: LoraModelCardProps) {
  const t = useTranslations("LoRA");
  const deleteMutation = useDeleteLoraModel();

  const statusStyle = STATUS_STYLES[model.status] ?? "bg-white/[0.06] text-slate-400";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3 transition-all hover:border-[#eab308]/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{model.name}</h3>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyle}`}
          >
            {model.status}
          </span>
        </div>

        <button
          onClick={() => deleteMutation.mutate(model.id)}
          disabled={deleteMutation.isPending}
          className="rounded-lg border border-white/[0.06] p-1.5 text-slate-500 transition-colors hover:border-red-500/30 hover:text-red-400 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>{t("triggerWord")}</span>
          <span className="font-mono text-[#eab308]">{model.trigger_word}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("images")}</span>
          <span className="text-white">{model.training_images_count}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("created")}</span>
          <span className="text-white">
            {new Date(model.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {model.status === "TRAINING" && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full animate-pulse rounded-full bg-sky-500/60" style={{ width: "60%" }} />
        </div>
      )}
    </div>
  );
}
