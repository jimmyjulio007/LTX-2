import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { Scene } from "../ui/SceneCard";

// ---------- Types ----------

interface ParseScriptResponse {
  scenes: Scene[];
}

interface GenerateStoryboardResponse {
  scenes: Scene[];
}

interface BatchGenerateResponse {
  jobIds: string[];
  scenes: Scene[];
}

// ---------- Service helpers ----------

async function parseScript(script: string): Promise<ParseScriptResponse> {
  const { data } = await apiClient.post<ParseScriptResponse>("/scripts/parse", { script });
  return data;
}

async function generateStoryboard(scenes: Scene[]): Promise<GenerateStoryboardResponse> {
  const { data } = await apiClient.post<GenerateStoryboardResponse>("/scripts/storyboard", {
    scenes,
  });
  return data;
}

async function generateScene(sceneId: string, prompt: string): Promise<{ jobId: string }> {
  const { data } = await apiClient.post<{ jobId: string }>(`/scripts/scenes/${sceneId}/generate`, {
    prompt,
  });
  return data;
}

async function batchGenerate(
  scenes: { id: string; prompt: string }[],
): Promise<BatchGenerateResponse> {
  const { data } = await apiClient.post<BatchGenerateResponse>("/scripts/batch-generate", {
    scenes,
  });
  return data;
}

async function fetchScenes(scriptId: string): Promise<Scene[]> {
  const { data } = await apiClient.get<Scene[]>(`/scripts/${scriptId}/scenes`);
  return data;
}

async function updateScenePrompt(
  sceneId: string,
  prompt: string,
): Promise<Scene> {
  const { data } = await apiClient.patch<Scene>(`/scripts/scenes/${sceneId}`, { prompt });
  return data;
}

// ---------- React Query hooks ----------

export function useParseScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (script: string) => parseScript(script),
    onSuccess: (data) => {
      queryClient.setQueryData(["script-scenes"], data.scenes);
    },
  });
}

export function useGenerateStoryboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenes: Scene[]) => generateStoryboard(scenes),
    onSuccess: (data) => {
      queryClient.setQueryData(["script-scenes"], data.scenes);
    },
  });
}

export function useGenerateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, prompt }: { sceneId: string; prompt: string }) =>
      generateScene(sceneId, prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["script-scenes"] });
    },
  });
}

export function useBatchGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenes: { id: string; prompt: string }[]) => batchGenerate(scenes),
    onSuccess: (data) => {
      queryClient.setQueryData(["script-scenes"], data.scenes);
    },
  });
}

export function useScriptScenes(scriptId: string) {
  return useQuery({
    queryKey: ["script-scenes", scriptId],
    queryFn: () => fetchScenes(scriptId),
    enabled: !!scriptId,
  });
}

export function useUpdateScenePrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, prompt }: { sceneId: string; prompt: string }) =>
      updateScenePrompt(sceneId, prompt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["script-scenes"] });
    },
  });
}
