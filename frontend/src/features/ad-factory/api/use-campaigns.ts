"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/ads/campaigns");
      return data;
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      product_description: string;
      product_url?: string;
      target_platform?: string;
      num_variations?: number;
    }) => {
      const { data } = await apiClient.post("/api/v1/ads/campaigns", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useOptimizeCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data } = await apiClient.patch(
        `/api/v1/ads/campaigns/${campaignId}/optimize`
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useCampaignPerformance(campaignId: string) {
  return useQuery({
    queryKey: ["campaign-performance", campaignId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/v1/ads/campaigns/${campaignId}/performance`
      );
      return data;
    },
    enabled: !!campaignId,
  });
}
