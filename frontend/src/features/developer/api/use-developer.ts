import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { ApiKey } from "@/entities/video-job/model/types";

/* ------------------------------------------------------------------ */
/*  API Keys                                                          */
/* ------------------------------------------------------------------ */

export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data } = await apiClient.get("/developer/api-keys");
      return data;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation<
    { api_key: string; key: ApiKey },
    Error,
    { name: string; permissions?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/developer/api-keys", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (keyId) => {
      await apiClient.delete(`/developer/api-keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Usage Stats                                                       */
/* ------------------------------------------------------------------ */

export interface DailyUsage {
  date: string;
  key_prefix: string;
  requests: number;
}

export function useUsageStats(days: number = 14) {
  return useQuery<DailyUsage[]>({
    queryKey: ["api-usage", days],
    queryFn: async () => {
      const { data } = await apiClient.get("/developer/usage", {
        params: { days },
      });
      return data;
    },
  });
}
