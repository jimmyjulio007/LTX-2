"use client";

import { useTranslations } from "next-intl";

type QualityTier = "draft" | "standard" | "premium";

interface QualitySelectorProps {
  selected: QualityTier;
  onChange: (tier: QualityTier) => void;
}

const TIERS: { id: QualityTier; credits: number }[] = [
  { id: "draft", credits: 0 },
  { id: "standard", credits: 1 },
  { id: "premium", credits: 3 },
];

export function QualitySelector({ selected, onChange }: QualitySelectorProps) {
  const t = useTranslations("Upscale");

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {t("qualityTier")}
      </label>

      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((tier) => {
          const isSelected = selected === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onChange(tier.id)}
              className={`relative rounded-xl border px-3 py-3 text-center transition-all ${
                isSelected
                  ? "border-[#eab308]/40 bg-[#eab308]/10"
                  : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.12] hover:bg-white/[0.06]"
              }`}
            >
              <span
                className={`block text-sm font-bold ${
                  isSelected ? "text-[#eab308]" : "text-white"
                }`}
              >
                {t(`tier_${tier.id}`)}
              </span>

              <span
                className={`mt-1 block text-[10px] font-medium ${
                  isSelected ? "text-[#eab308]/70" : "text-slate-500"
                }`}
              >
                {tier.credits === 0
                  ? t("free")
                  : t("credits", { count: tier.credits })}
              </span>

              {isSelected && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#eab308]">
                  <svg
                    className="h-2.5 w-2.5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
