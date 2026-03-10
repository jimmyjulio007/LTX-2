"use client";

import { useTranslations } from "next-intl";

interface EnhancedPromptPreviewProps {
  original: string;
  enhanced: string;
  onApply: () => void;
  onUseOriginal: () => void;
}

export function EnhancedPromptPreview({
  original,
  enhanced,
  onApply,
  onUseOriginal,
}: EnhancedPromptPreviewProps) {
  const t = useTranslations("Prompt");

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-[#eab308]/20 bg-[#eab308]/[0.03] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">{t("original")}</p>
          <p className="rounded-lg bg-white/[0.04] p-3 text-sm text-slate-400">{original}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-[#eab308]">
            &#10024; {t("enhanced")}
          </p>
          <p className="rounded-lg bg-white/[0.04] p-3 text-sm text-white">{enhanced}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onUseOriginal}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          {t("useOriginal")}
        </button>
        <button
          type="button"
          onClick={onApply}
          className="btn-gold rounded-lg px-4 py-1.5 text-sm"
        >
          {t("applyEnhanced")}
        </button>
      </div>
    </div>
  );
}
