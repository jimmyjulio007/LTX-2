"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useEnhancePrompt } from "../api/use-enhance-prompt";
import { EnhancedPromptPreview } from "./EnhancedPromptPreview";

interface MagicPromptToggleProps {
  prompt: string;
  onApply: (enhanced: string) => void;
}

export function MagicPromptToggle({ prompt, onApply }: MagicPromptToggleProps) {
  const t = useTranslations("Prompt");
  const [showPreview, setShowPreview] = useState(false);
  const { mutate, data, isPending } = useEnhancePrompt();

  const handleEnhance = () => {
    if (!prompt.trim()) return;
    mutate(
      { prompt },
      {
        onSuccess: () => setShowPreview(true),
      },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleEnhance}
        disabled={isPending || !prompt.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-[#eab308]/10 px-3 py-1.5 text-sm text-[#eab308] transition-all hover:bg-[#eab308]/20 disabled:opacity-50"
      >
        <span className="text-base">&#10024;</span>
        {isPending ? t("enhancing") : t("enhance")}
      </button>

      {showPreview && data && (
        <EnhancedPromptPreview
          original={data.original}
          enhanced={data.enhanced}
          onApply={() => {
            onApply(data.enhanced);
            setShowPreview(false);
          }}
          onUseOriginal={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
