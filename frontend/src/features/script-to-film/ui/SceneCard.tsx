"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export interface Scene {
  id: string;
  sceneNumber: number;
  description: string;
  prompt: string;
  cameraAngle: string;
  duration?: number;
  thumbnail_url?: string;
  status?: "pending" | "generating" | "completed" | "failed";
}

interface SceneCardProps {
  scene: Scene;
  onPromptChange?: (sceneId: string, prompt: string) => void;
  onGenerate?: (sceneId: string) => void;
  isGenerating?: boolean;
}

export function SceneCard({ scene, onPromptChange, onGenerate, isGenerating }: SceneCardProps) {
  const t = useTranslations("ScriptStudio");
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(scene.prompt);

  const handleSavePrompt = useCallback(() => {
    onPromptChange?.(scene.id, editedPrompt);
    setIsEditing(false);
  }, [scene.id, editedPrompt, onPromptChange]);

  const handleCancelEdit = useCallback(() => {
    setEditedPrompt(scene.prompt);
    setIsEditing(false);
  }, [scene.prompt]);

  const statusColor = {
    pending: "text-slate-500",
    generating: "text-[#eab308]",
    completed: "text-emerald-400",
    failed: "text-red-400",
  };

  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.12]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eab308]/10 text-[10px] font-bold text-[#eab308]">
            {scene.sceneNumber}
          </span>
          <h4 className="text-xs font-medium text-white">{t("scene")} {scene.sceneNumber}</h4>
        </div>

        {scene.status && (
          <span className={`text-[10px] font-medium uppercase tracking-wider ${statusColor[scene.status]}`}>
            {t(`status_${scene.status}`)}
          </span>
        )}
      </div>

      {/* Thumbnail preview */}
      <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-black/40">
        {scene.thumbnail_url ? (
          <Image
            src={scene.thumbnail_url}
            alt={`Scene ${scene.sceneNumber}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] text-slate-600">{t("noPreview")}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mb-2 text-xs text-slate-400">{scene.description}</p>

      {/* Camera angle */}
      <div className="mb-3 flex items-center gap-1.5">
        <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span className="text-[11px] text-slate-500">{scene.cameraAngle}</span>
      </div>

      {/* Prompt field */}
      <div className="rounded-lg border border-white/[0.06] bg-black/30 p-2.5">
        <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">
          {t("prompt")}
        </label>

        {isEditing ? (
          <div>
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={3}
              className="block w-full resize-none rounded bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded px-2 py-1 text-[10px] text-slate-500 hover:text-white"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleSavePrompt}
                className="rounded bg-[#eab308]/10 px-2 py-1 text-[10px] text-[#eab308] hover:bg-[#eab308]/20"
              >
                {t("save")}
              </button>
            </div>
          </div>
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="cursor-text text-xs text-slate-300 hover:text-white"
          >
            {scene.prompt}
          </p>
        )}
      </div>

      {/* Generate button */}
      {onGenerate && (
        <button
          type="button"
          onClick={() => onGenerate(scene.id)}
          disabled={isGenerating || scene.status === "generating"}
          className="mt-3 w-full rounded-lg bg-[#eab308]/10 px-3 py-2 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:opacity-50"
        >
          {isGenerating || scene.status === "generating" ? t("generating") : t("generateScene")}
        </button>
      )}
    </div>
  );
}
