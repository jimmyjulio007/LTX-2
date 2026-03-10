"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePromptTemplates } from "../api/use-prompt-templates";
import { TemplateCard } from "./TemplateCard";
import { PROMPT_CATEGORIES } from "@/entities/prompt-template/model/types";

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (promptText: string) => void;
}

export function PromptLibraryModal({ isOpen, onClose, onApply }: PromptLibraryModalProps) {
  const t = useTranslations("Prompt");
  const locale = useLocale();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: templates, isLoading } = usePromptTemplates(category);

  if (!isOpen) return null;

  const handleApply = (promptText: string) => {
    onApply(promptText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a]">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h2 className="gradient-text text-xl font-bold">{t("library")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("libraryDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-5 py-3">
          <button
            onClick={() => setCategory(undefined)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
              !category
                ? "bg-[#eab308]/20 text-[#eab308]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t("categories.all")}
          </button>
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                category === cat
                  ? "bg-[#eab308]/20 text-[#eab308]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="max-h-[50vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eab308] border-t-transparent" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  locale={locale}
                  onApply={handleApply}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-slate-500">{t("noTemplates")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
