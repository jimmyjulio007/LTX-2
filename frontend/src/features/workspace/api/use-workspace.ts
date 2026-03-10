import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { Workspace, WorkspaceMember } from "@/entities/video-job/model/types";

/* ------------------------------------------------------------------ */
/*  Workspaces                                                        */
/* ------------------------------------------------------------------ */

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await apiClient.get("/workspaces");
      return data;
    },
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery<Workspace>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}`);
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, Error, { name: string }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/workspaces", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, Error, { workspaceId: string; name: string }>({
    mutationFn: async ({ workspaceId, name }) => {
      const { data } = await apiClient.patch(`/workspaces/${workspaceId}`, { name });
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (workspaceId) => {
      await apiClient.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Members                                                           */
/* ------------------------------------------------------------------ */

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery<WorkspaceMember[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workspaces/${workspaceId}/members`);
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation<
    WorkspaceMember,
    Error,
    { workspaceId: string; email: string; role: string }
  >({
    mutationFn: async ({ workspaceId, email, role }) => {
      const { data } = await apiClient.post(
        `/workspaces/${workspaceId}/members/invite`,
        { email, role }
      );
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { workspaceId: string; memberId: string }>({
    mutationFn: async ({ workspaceId, memberId }) => {
      await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    },
  });
}
