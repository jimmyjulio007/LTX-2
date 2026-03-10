import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { Project, ProjectClip } from "@/entities/video-job/model/types";

// ---------- Service helpers ----------

async function fetchProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>("/projects");
  return data;
}

async function fetchProject(id: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${id}`);
  return data;
}

async function createProject(payload: { name: string; description?: string }): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects", payload);
  return data;
}

async function updateProject(
  id: string,
  payload: Partial<Pick<Project, "name" | "description">>,
): Promise<Project> {
  const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
  return data;
}

async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

// --- Clips ---

async function fetchClips(projectId: string): Promise<ProjectClip[]> {
  const { data } = await apiClient.get<ProjectClip[]>(`/projects/${projectId}/clips`);
  return data;
}

async function addClip(
  projectId: string,
  payload: { job_id: string; position: number; transition_type?: string },
): Promise<ProjectClip> {
  const { data } = await apiClient.post<ProjectClip>(`/projects/${projectId}/clips`, payload);
  return data;
}

async function updateClip(
  projectId: string,
  clipId: string,
  payload: Partial<Pick<ProjectClip, "position" | "start_trim" | "end_trim" | "transition_type" | "transition_duration">>,
): Promise<ProjectClip> {
  const { data } = await apiClient.patch<ProjectClip>(
    `/projects/${projectId}/clips/${clipId}`,
    payload,
  );
  return data;
}

async function deleteClip(projectId: string, clipId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/clips/${clipId}`);
}

// ---------- React Query hooks ----------

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string }) =>
      updateProject(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// --- Clip hooks ---

export function useProjectClips(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "clips"],
    queryFn: () => fetchClips(projectId),
    enabled: !!projectId,
  });
}

export function useAddClip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      ...payload
    }: {
      projectId: string;
      job_id: string;
      position: number;
      transition_type?: string;
    }) => addClip(projectId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "clips"] });
    },
  });
}

export function useUpdateClip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      clipId,
      ...payload
    }: {
      projectId: string;
      clipId: string;
      position?: number;
      start_trim?: number;
      end_trim?: number;
      transition_type?: string;
      transition_duration?: number;
    }) => updateClip(projectId, clipId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "clips"] });
    },
  });
}

export function useDeleteClip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, clipId }: { projectId: string; clipId: string }) =>
      deleteClip(projectId, clipId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects", variables.projectId, "clips"] });
    },
  });
}
