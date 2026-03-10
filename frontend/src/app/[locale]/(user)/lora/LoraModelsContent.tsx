"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLoraModels } from "@/features/lora-training/api/use-lora";
import { LoraModelCard } from "@/features/lora-training/ui/LoraModelCard";
import { LoraUploadWizard } from "@/features/lora-training/ui/LoraUploadWizard";

export function LoraModelsContent() {
  const t = useTranslations("LoRA");
  const { data: models, isLoading } = useLoraModels();
  const [showWizard, setShowWizard] = useState(false);

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {models?.length ?? 0} {t("modelsCount")}
        </p>
        <button
          onClick={() => setShowWizard(true)}
          className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          {t("trainNew")}
        </button>
      </div>

      {showWizard && <LoraUploadWizard onClose={() => setShowWizard(false)} />}

      {models && models.length === 0 && !showWizard && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-slate-500">{t("noModels")}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models?.map((model) => (
          <LoraModelCard key={model.id} model={model} />
        ))}
      </div>
    </div>
  );
}
