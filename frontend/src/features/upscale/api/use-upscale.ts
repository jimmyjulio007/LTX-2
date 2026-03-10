"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

interface UpscalePayload {
  jobId: string;
  mode: "4k" | "60fps";
}

interface UpscalePricing {
  "4k": number;
  "60fps": number;
  "4k_60fps": number;
}

export function useUpscalePricing() {
  return useQuery<UpscalePricing>({
    queryKey: ["upscale-pricing"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/upscale/pricing");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpscale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, mode }: UpscalePayload) => {
      const { data } = await apiClient.post(`/api/v1/upscale/${jobId}`, {
        mode,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["job", variables.jobId] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}
