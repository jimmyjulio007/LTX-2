"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { PromptTemplate } from "@/entities/prompt-template/model/types";

interface TemplateCardProps {
  template: PromptTemplate;
  locale: string;
  onApply: (promptText: string) => void;
}

export function TemplateCard({ template, locale, onApply }: TemplateCardProps) {
  const t = useTranslations("Prompt");
  const displayName = locale === "fr" && template.name_fr ? template.name_fr : template.name;

  return (
    <div className="glass-card group relative overflow-hidden p-4 transition-all hover:border-[#eab308]/30">
      {template.thumbnail_url && (
        <div className="relative mb-3 aspect-video overflow-hidden rounded-lg">
          <Image
            src={template.thumbnail_url}
            alt={displayName}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <h3 className="mb-1 text-sm font-medium text-white">{displayName}</h3>
      <p className="mb-3 line-clamp-2 text-xs text-slate-500">{template.prompt_text}</p>

      <button
        type="button"
        onClick={() => onApply(template.prompt_text)}
        className="w-full rounded-lg bg-[#eab308]/10 px-3 py-1.5 text-xs text-[#eab308] transition-colors hover:bg-[#eab308]/20"
      >
        {t("applyTemplate")}
      </button>
    </div>
  );
}
