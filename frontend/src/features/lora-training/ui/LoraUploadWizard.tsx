"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useCreateLoraModel } from "../api/use-lora";

type Step = "upload" | "name" | "trigger" | "confirm";

export function LoraUploadWizard({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("LoRA");
  const createMutation = useCreateLoraModel();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<File[]>([]);
  const [modelName, setModelName] = useState("");
  const [triggerWord, setTriggerWord] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTrain = async () => {
    await createMutation.mutateAsync({
      name: modelName,
      trigger_word: triggerWord,
      images,
    });
    onClose?.();
  };

  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: t("stepUpload") },
    { key: "name", label: t("stepName") },
    { key: "trigger", label: t("stepTrigger") },
    { key: "confirm", label: t("stepConfirm") },
  ];

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="glass-card space-y-6 p-6">
      <h2 className="text-lg font-semibold text-white">{t("trainModel")}</h2>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentIndex
                  ? "bg-[#eab308] text-black"
                  : "bg-white/[0.06] text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-xs sm:inline ${
                i <= currentIndex ? "text-white" : "text-slate-500"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  i < currentIndex ? "bg-[#eab308]/40" : "bg-white/[0.06]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === "upload" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{t("uploadDesc")}</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-white/[0.08] p-10 text-center transition-colors hover:border-[#eab308]/30 cursor-pointer"
          >
            <svg className="mx-auto h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-3 text-sm text-slate-500">{t("dropImages")}</p>
            <p className="mt-1 text-xs text-slate-600">{t("minImages")}</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {images.map((file, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-white/[0.06]">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep("name")}
              disabled={images.length < 5}
              className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === "name" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{t("nameDesc")}</p>

          <div>
            <label className="mb-1 block text-xs text-slate-400">{t("modelName")}</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={t("modelNamePlaceholder")}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("upload")}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("back")}
            </button>
            <button
              onClick={() => setStep("trigger")}
              disabled={!modelName.trim()}
              className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === "trigger" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{t("triggerDesc")}</p>

          <div>
            <label className="mb-1 block text-xs text-slate-400">{t("triggerWord")}</label>
            <input
              type="text"
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              placeholder={t("triggerWordPlaceholder")}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("name")}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("back")}
            </button>
            <button
              onClick={() => setStep("confirm")}
              disabled={!triggerWord.trim()}
              className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{t("confirmDesc")}</p>

          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("modelName")}</span>
              <span className="text-white">{modelName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("triggerWord")}</span>
              <span className="font-mono text-[#eab308]">{triggerWord}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("images")}</span>
              <span className="text-white">{images.length}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("trigger")}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("back")}
            </button>
            <button
              onClick={handleTrain}
              disabled={createMutation.isPending}
              className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? t("training") : t("startTraining")}
            </button>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-red-400">{t("trainError")}</p>
          )}
        </div>
      )}
    </div>
  );
}
