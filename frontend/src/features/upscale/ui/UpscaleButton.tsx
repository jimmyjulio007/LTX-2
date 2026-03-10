"use client";

import { useTranslations } from "next-intl";
import { useUpscale } from "../api/use-upscale";

interface UpscaleButtonProps {
  jobId: string;
  mode: "4k" | "60fps";
  creditCost?: number;
  disabled?: boolean;
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function UpscaleButton({
  jobId,
  mode,
  creditCost = 1,
  disabled = false,
}: UpscaleButtonProps) {
  const t = useTranslations("Upscale");
  const upscale = useUpscale();

  const handleUpscale = () => {
    upscale.mutate({ jobId, mode });
  };

  const label = mode === "4k" ? "4K" : "60fps";
  const isLoading = upscale.isPending;

  return (
    <button
      onClick={handleUpscale}
      disabled={disabled || isLoading}
      className="group relative inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-all hover:border-[#eab308]/30 hover:bg-[#eab308]/10 hover:text-[#eab308] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      )}

      <span>{label}</span>

      {/* Credit cost badge */}
      <span className="ml-0.5 rounded-md bg-[#eab308]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#eab308]">
        {creditCost} {t("cr")}
      </span>

      {upscale.isError && (
        <span className="absolute -bottom-6 left-0 text-[10px] text-red-400">
          {t("error")}
        </span>
      )}
    </button>
  );
}
