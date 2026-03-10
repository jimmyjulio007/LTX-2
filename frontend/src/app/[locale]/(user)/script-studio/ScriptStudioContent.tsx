"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ScriptUploader } from "@/features/script-to-film/ui/ScriptUploader";
import { StoryboardView } from "@/features/script-to-film/ui/StoryboardView";
import {
  useParseScript,
  useGenerateScene,
  useBatchGenerate,
  useUpdateScenePrompt,
} from "@/features/script-to-film/api/use-scripts";
import type { Scene } from "@/features/script-to-film/ui/SceneCard";

export function ScriptStudioContent() {
  const t = useTranslations("ScriptStudio");
  const [scriptText, setScriptText] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [generatingSceneIds, setGeneratingSceneIds] = useState<string[]>([]);

  const parseScript = useParseScript();
  const generateScene = useGenerateScene();
  const batchGenerate = useBatchGenerate();
  const updatePrompt = useUpdateScenePrompt();

  const handleParseScript = useCallback(() => {
    if (!scriptText.trim()) return;
    parseScript.mutate(scriptText, {
      onSuccess: (data) => {
        setScenes(data.scenes);
      },
    });
  }, [scriptText, parseScript]);

  const handlePromptChange = useCallback(
    (sceneId: string, prompt: string) => {
      setScenes((prev) => prev.map((s) => (s.id === sceneId ? { ...s, prompt } : s)));
      updatePrompt.mutate({ sceneId, prompt });
    },
    [updatePrompt],
  );

  const handleGenerateScene = useCallback(
    (sceneId: string) => {
      const scene = scenes.find((s) => s.id === sceneId);
      if (!scene) return;

      setGeneratingSceneIds((prev) => [...prev, sceneId]);
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, status: "generating" as const } : s)),
      );

      generateScene.mutate(
        { sceneId, prompt: scene.prompt },
        {
          onSuccess: () => {
            setScenes((prev) =>
              prev.map((s) => (s.id === sceneId ? { ...s, status: "completed" as const } : s)),
            );
            setGeneratingSceneIds((prev) => prev.filter((id) => id !== sceneId));
          },
          onError: () => {
            setScenes((prev) =>
              prev.map((s) => (s.id === sceneId ? { ...s, status: "failed" as const } : s)),
            );
            setGeneratingSceneIds((prev) => prev.filter((id) => id !== sceneId));
          },
        },
      );
    },
    [scenes, generateScene],
  );

  const handleGenerateAll = useCallback(() => {
    const pendingScenes = scenes
      .filter((s) => s.status !== "completed" && s.status !== "generating")
      .map((s) => ({ id: s.id, prompt: s.prompt }));

    if (pendingScenes.length === 0) return;

    setGeneratingSceneIds(pendingScenes.map((s) => s.id));
    setScenes((prev) =>
      prev.map((s) =>
        pendingScenes.some((ps) => ps.id === s.id) ? { ...s, status: "generating" as const } : s,
      ),
    );

    batchGenerate.mutate(pendingScenes, {
      onSuccess: (data) => {
        setScenes(data.scenes);
        setGeneratingSceneIds([]);
      },
      onError: () => {
        setScenes((prev) =>
          prev.map((s) =>
            generatingSceneIds.includes(s.id) ? { ...s, status: "failed" as const } : s,
          ),
        );
        setGeneratingSceneIds([]);
      },
    });
  }, [scenes, batchGenerate, generatingSceneIds]);

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">{t("pageTitle")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("pageSubtitle")}</p>
          </div>

          {scriptText.trim() && scenes.length === 0 && (
            <button
              type="button"
              onClick={handleParseScript}
              disabled={parseScript.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-[#eab308]/10 px-4 py-2 text-sm font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {parseScript.isPending ? t("parsing") : t("parseScript")}
            </button>
          )}
        </div>

        {/* Script input */}
        <ScriptUploader
          value={scriptText}
          onScriptChange={setScriptText}
          isLoading={parseScript.isPending}
        />

        {/* Storyboard */}
        {scenes.length > 0 && (
          <StoryboardView
            scenes={scenes}
            onPromptChange={handlePromptChange}
            onGenerateScene={handleGenerateScene}
            onGenerateAll={handleGenerateAll}
            generatingSceneIds={generatingSceneIds}
            isGeneratingAll={batchGenerate.isPending}
          />
        )}
      </div>
    </div>
  );
}
