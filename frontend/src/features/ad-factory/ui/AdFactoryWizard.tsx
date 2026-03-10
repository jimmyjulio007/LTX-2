"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateCampaign } from "../api/use-campaigns";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", icon: "T" },
  { id: "instagram", label: "Instagram", icon: "I" },
  { id: "youtube", label: "YouTube", icon: "Y" },
  { id: "facebook", label: "Facebook", icon: "F" },
  { id: "twitter", label: "X / Twitter", icon: "X" },
] as const;

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              i + 1 <= currentStep
                ? "bg-[#eab308] text-black"
                : "bg-white/[0.06] text-slate-500"
            }`}
          >
            {i + 1 < currentStep ? (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-px w-8 transition-colors ${
                i + 1 < currentStep ? "bg-[#eab308]/40" : "bg-white/[0.06]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

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

export function AdFactoryWizard() {
  const t = useTranslations("AdFactory");
  const createCampaign = useCreateCampaign();

  const [step, setStep] = useState(1);
  const [productUrl, setProductUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [numVariations, setNumVariations] = useState(3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const canProceedStep1 = productDescription.trim().length > 0 || productUrl.trim().length > 0;
  const canProceedStep2 = productDescription.trim().length > 0;

  const handleGenerate = async () => {
    try {
      const campaign = await createCampaign.mutateAsync({
        product_description: productDescription,
        product_url: productUrl || undefined,
        target_platform: selectedPlatform,
        num_variations: numVariations,
      });
      setResult(campaign);
      setStep(4);
    } catch {
      // Error is handled by the mutation state
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
        <StepIndicator currentStep={step} totalSteps={4} />

        {/* Step 1: Product Input */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {t("step1Title")}
              </h2>
              <p className="text-sm text-slate-500">{t("step1Subtitle")}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                {t("productUrl")}
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors"
                placeholder="https://your-product.com"
              />
              <p className="mt-1.5 text-xs text-slate-600">
                {t("productUrlHint")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
                {t("or")}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                {t("productDescription")}
              </label>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors resize-none"
                placeholder={t("descriptionPlaceholder")}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full rounded-xl btn-gold py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("continue")}
            </button>
          </div>
        )}

        {/* Step 2: Review Product */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {t("step2Title")}
              </h2>
              <p className="text-sm text-slate-500">{t("step2Subtitle")}</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-4 space-y-3">
              {productUrl && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {t("url")}
                  </span>
                  <p className="mt-1 text-sm text-[#eab308] break-all">
                    {productUrl}
                  </p>
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {t("description")}
                </span>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/40 focus:outline-none focus:ring-1 focus:ring-[#eab308]/20 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-sm font-bold text-white hover:bg-white/[0.08] transition-colors"
              >
                {t("back")}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 rounded-xl btn-gold py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Platform & Variations */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {t("step3Title")}
              </h2>
              <p className="text-sm text-slate-500">{t("step3Subtitle")}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                {t("targetPlatform")}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      selectedPlatform === platform.id
                        ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                        : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-xs font-bold">
                      {platform.icon}
                    </span>
                    {platform.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                {t("variations")}
              </label>
              <div className="flex items-center gap-3">
                {[1, 3, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => setNumVariations(count)}
                    className={`flex-1 rounded-xl border py-3 text-center text-sm font-bold transition-all ${
                      numVariations === count
                        ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                        : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {t("variationsHint", { count: numVariations })}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 text-sm font-bold text-white hover:bg-white/[0.08] transition-colors"
              >
                {t("back")}
              </button>
              <button
                onClick={handleGenerate}
                disabled={createCampaign.isPending}
                className="flex-1 rounded-xl btn-gold py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  {createCampaign.isPending && <Spinner />}
                  {createCampaign.isPending
                    ? t("generating")
                    : t("generateAds")}
                </span>
              </button>
            </div>

            {createCampaign.isError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
                {t("generateError")}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {t("step4Title")}
              </h2>
              <p className="text-sm text-slate-500">{t("step4Subtitle")}</p>
            </div>

            <div className="rounded-xl border border-[#eab308]/20 bg-[#eab308]/[0.04] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eab308]/20">
                  <svg
                    className="h-5 w-5 text-[#eab308]"
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
                <div>
                  <p className="text-sm font-medium text-white">
                    {t("campaignCreated")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("campaignId")}: {result?.id?.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {result?.variations && result.variations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {t("generatedVariations")}
                  </p>
                  <div className="grid gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {result.variations.map((v: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white">
                            {t("variation")} #{i + 1}
                          </span>
                          <span className="text-xs text-slate-500">
                            {v.status || "pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setStep(1);
                setProductUrl("");
                setProductDescription("");
                setResult(null);
              }}
              className="w-full rounded-xl btn-gold py-3.5 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
            >
              {t("createAnother")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
