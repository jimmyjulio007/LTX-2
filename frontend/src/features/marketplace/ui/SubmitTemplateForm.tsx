"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSubmitTemplate } from "../api/use-marketplace";

const CATEGORIES = [
  "marketing",
  "social",
  "cinematic",
  "product",
  "educational",
  "music",
] as const;

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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

export function SubmitTemplateForm() {
  const t = useTranslations("Marketplace");
  const submitMutation = useSubmitTemplate();

  const [name, setName] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [priceCredits, setPriceCredits] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    promptText.trim().length > 0 &&
    priceCredits >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await submitMutation.mutateAsync({
        name,
        name_fr: nameFr || undefined,
        description,
        description_fr: descriptionFr || undefined,
        prompt_text: promptText,
        negative_prompt: negativePrompt || undefined,
        category,
        price_credits: priceCredits,
      });
      setSubmitted(true);
    } catch {
      // Error is handled by mutation state
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#eab308]/20 bg-[#eab308]/[0.04] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eab308]/20">
          <svg
            className="h-6 w-6 text-[#eab308]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">
          {t("submitSuccess")}
        </h3>
        <p className="text-sm text-slate-400">{t("submitSuccessDesc")}</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setNameFr("");
            setDescription("");
            setDescriptionFr("");
            setPromptText("");
            setNegativePrompt("");
            setPriceCredits(5);
          }}
          className="mt-6 rounded-xl btn-gold px-6 py-3 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
        >
          {t("submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 space-y-5"
    >
      <div>
        <h2 className="text-lg font-bold text-white mb-1">
          {t("submitTitle")}
        </h2>
        <p className="text-sm text-slate-500">{t("submitSubtitle")}</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("templateName")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("templateNameFr")}
          </label>
          <input
            type="text"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
            placeholder={t("nameFrPlaceholder")}
          />
        </div>
      </div>

      {/* Description */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("templateDescription")} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors resize-none"
            placeholder={t("descriptionPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("templateDescriptionFr")}
          </label>
          <textarea
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors resize-none"
            placeholder={t("descriptionFrPlaceholder")}
          />
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {t("promptText")} *
        </label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
          rows={4}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors resize-none font-mono"
          placeholder={t("promptPlaceholder")}
        />
      </div>

      {/* Negative prompt */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
          {t("negativePrompt")}
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
          placeholder={t("negativePromptPlaceholder")}
        />
      </div>

      {/* Category & Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("category")} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0a0a0a]">
                {t(`category_${cat}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            {t("priceCredits")} *
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={priceCredits}
              onChange={(e) => setPriceCredits(Number(e.target.value))}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-16 text-sm text-white focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#eab308]">
              {t("credits")}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {submitMutation.isError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
          {t("submitError")}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || submitMutation.isPending}
        className="w-full rounded-xl btn-gold py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center justify-center gap-2">
          {submitMutation.isPending && <Spinner />}
          {submitMutation.isPending ? t("submitting") : t("submitTemplate")}
        </span>
      </button>
    </form>
  );
}
