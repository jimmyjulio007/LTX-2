"use client";

import { useTranslations } from "next-intl";

interface MotionPathToolbarProps {
  interpolation: "linear" | "bezier";
  onInterpolationChange: (mode: "linear" | "bezier") => void;
  onAddPoint: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  pointCount: number;
  hasSelection: boolean;
}

export function MotionPathToolbar({
  interpolation,
  onInterpolationChange,
  onAddPoint,
  onDeleteSelected,
  onClearAll,
  pointCount,
  hasSelection,
}: MotionPathToolbarProps) {
  const t = useTranslations("MotionPath");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      {/* Add point */}
      <button
        type="button"
        onClick={onAddPoint}
        className="flex items-center gap-1.5 rounded-lg bg-[#eab308]/10 px-3 py-1.5 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t("addPoint")}
      </button>

      {/* Delete selected */}
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {t("delete")}
      </button>

      {/* Clear all */}
      <button
        type="button"
        onClick={onClearAll}
        disabled={pointCount === 0}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400/70 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        {t("clearAll")}
      </button>

      {/* Separator */}
      <div className="mx-1 h-5 w-px bg-white/[0.06]" />

      {/* Interpolation toggle */}
      <div className="flex items-center overflow-hidden rounded-lg border border-white/[0.06]">
        <button
          type="button"
          onClick={() => onInterpolationChange("linear")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            interpolation === "linear"
              ? "bg-[#eab308]/10 text-[#eab308]"
              : "text-slate-500 hover:text-white"
          }`}
        >
          {t("linear")}
        </button>
        <button
          type="button"
          onClick={() => onInterpolationChange("bezier")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            interpolation === "bezier"
              ? "bg-[#eab308]/10 text-[#eab308]"
              : "text-slate-500 hover:text-white"
          }`}
        >
          {t("bezier")}
        </button>
      </div>

      {/* Point count */}
      <span className="ml-auto text-[11px] tabular-nums text-slate-500">
        {t("pointCount", { count: pointCount })}
      </span>
    </div>
  );
}
