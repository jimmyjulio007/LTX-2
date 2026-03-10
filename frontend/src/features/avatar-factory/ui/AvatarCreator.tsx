"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateAvatar } from "../api/use-avatars";
import { useLoraModels } from "@/features/lora-training/api/use-lora";

interface AvatarCreatorProps {
  onClose?: () => void;
}

export function AvatarCreator({ onClose }: AvatarCreatorProps) {
  const t = useTranslations("Avatar");
  const createMutation = useCreateAvatar();
  const { data: loraModels } = useLoraModels();

  const [name, setName] = useState("");
  const [loraModelId, setLoraModelId] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");

  const readyModels = loraModels?.filter((m) => m.status === "READY") ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !stylePrompt.trim()) return;

    await createMutation.mutateAsync({
      name: name.trim(),
      lora_model_id: loraModelId || undefined,
      style_prompt: stylePrompt.trim(),
    });

    setName("");
    setLoraModelId("");
    setStylePrompt("");
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-5 p-6">
      <h2 className="text-lg font-semibold text-white">{t("createAvatar")}</h2>

      {/* Name */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">{t("avatarName")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("avatarNamePlaceholder")}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
        />
      </div>

      {/* LoRA model select */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">{t("loraModel")}</label>
        <select
          value={loraModelId}
          onChange={(e) => setLoraModelId(e.target.value)}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#eab308]/40 cursor-pointer"
        >
          <option value="" className="bg-[#0a0a0a]">
            {t("noLoraModel")}
          </option>
          {readyModels.map((model) => (
            <option key={model.id} value={model.id} className="bg-[#0a0a0a]">
              {model.name} ({model.trigger_word})
            </option>
          ))}
        </select>
      </div>

      {/* Style prompt */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">{t("stylePrompt")}</label>
        <textarea
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          placeholder={t("stylePromptPlaceholder")}
          rows={4}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={createMutation.isPending || !name.trim() || !stylePrompt.trim()}
          className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
        >
          {createMutation.isPending ? t("creating") : t("create")}
        </button>
      </div>

      {createMutation.isError && (
        <p className="text-sm text-red-400">{t("createError")}</p>
      )}
    </form>
  );
}
