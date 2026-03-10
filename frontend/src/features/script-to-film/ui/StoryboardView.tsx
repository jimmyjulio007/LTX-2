"use client";

import { useTranslations } from "next-intl";
import { SceneCard, type Scene } from "./SceneCard";

interface StoryboardViewProps {
  scenes: Scene[];
  onPromptChange?: (sceneId: string, prompt: string) => void;
  onGenerateScene?: (sceneId: string) => void;
  onGenerateAll?: () => void;
  generatingSceneIds?: string[];
  isGeneratingAll?: boolean;
}

export function StoryboardView({
  scenes,
  onPromptChange,
  onGenerateScene,
  onGenerateAll,
  generatingSceneIds = [],
  isGeneratingAll,
}: StoryboardViewProps) {
  const t = useTranslations("ScriptStudio");

  const completedCount = scenes.filter((s) => s.status === "completed").length;
  const progressPercentage = scenes.length > 0 ? Math.round((completedCount / scenes.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{t("storyboard")}</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {t("sceneCount", { count: scenes.length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          {scenes.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[#eab308] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-slate-500">
                {completedCount}/{scenes.length}
              </span>
            </div>
          )}

          {/* Generate all button */}
          {onGenerateAll && scenes.length > 0 && (
            <button
              type="button"
              onClick={onGenerateAll}
              disabled={isGeneratingAll}
              className="flex items-center gap-1.5 rounded-lg bg-[#eab308]/10 px-3 py-1.5 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isGeneratingAll ? t("generatingAll") : t("generateAll")}
            </button>
          )}
        </div>
      </div>

      {/* Scene grid */}
      {scenes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onPromptChange={onPromptChange}
              onGenerate={onGenerateScene}
              isGenerating={generatingSceneIds.includes(scene.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-16">
          <svg className="mb-3 h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-2 6a2 2 0 104 0m-4 0a2 2 0 114 0m6-6V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-2 6a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          <p className="text-sm text-slate-500">{t("noScenes")}</p>
          <p className="mt-1 text-xs text-slate-600">{t("uploadScriptFirst")}</p>
        </div>
      )}
    </div>
  );
}
