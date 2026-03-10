import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { Avatar, ScheduledPost } from "@/entities/video-job/model/types";

/* ------------------------------------------------------------------ */
/*  Avatars                                                           */
/* ------------------------------------------------------------------ */

export function useAvatars() {
  return useQuery<Avatar[]>({
    queryKey: ["avatars"],
    queryFn: async () => {
      const { data } = await apiClient.get("/avatars");
      return data;
    },
  });
}

export function useCreateAvatar() {
  const queryClient = useQueryClient();
  return useMutation<
    Avatar,
    Error,
    { name: string; lora_model_id?: string; style_prompt: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/avatars", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (avatarId) => {
      await apiClient.delete(`/avatars/${avatarId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatars"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Scheduled Posts                                                    */
/* ------------------------------------------------------------------ */

export function useScheduledPosts(avatarId?: string) {
  return useQuery<ScheduledPost[]>({
    queryKey: ["scheduled-posts", avatarId],
    queryFn: async () => {
      const { data } = await apiClient.get("/avatars/posts", {
        params: avatarId ? { avatar_id: avatarId } : undefined,
      });
      return data;
    },
  });
}

export function useSchedulePost() {
  const queryClient = useQueryClient();
  return useMutation<
    ScheduledPost,
    Error,
    {
      avatar_id: string;
      prompt: string;
      platform: string;
      scheduled_at: string;
    }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/avatars/posts", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });
}

export function useCalendar(weekOffset: number = 0) {
  return useQuery<ScheduledPost[]>({
    queryKey: ["calendar", weekOffset],
    queryFn: async () => {
      const { data } = await apiClient.get("/avatars/calendar", {
        params: { week_offset: weekOffset },
      });
      return data;
    },
  });
}
