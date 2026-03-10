"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { MarketplaceTemplate } from "@/entities/video-job/model/types";

interface BrowseParams {
  category?: string;
  page?: number;
  limit?: number;
}

interface BrowseResponse {
  templates: MarketplaceTemplate[];
  total: number;
  page: number;
  limit: number;
}

interface SubmitPayload {
  name: string;
  name_fr?: string;
  description: string;
  description_fr?: string;
  prompt_text: string;
  negative_prompt?: string;
  category: string;
  price_credits: number;
  thumbnail_url?: string;
  preview_video_url?: string;
}

interface EarningsResponse {
  total_earned: number;
  pending_payout: number;
  total_sales: number;
  templates: {
    template_id: string;
    name: string;
    sales: number;
    earned: number;
  }[];
}

export function useMarketplaceTemplates(params: BrowseParams = {}) {
  return useQuery<BrowseResponse>({
    queryKey: ["marketplace", params],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/marketplace/templates", {
        params,
      });
      return data;
    },
  });
}

export function usePurchaseTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data } = await apiClient.post(
        `/api/v1/marketplace/templates/${templateId}/purchase`
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

export function useSubmitTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      const { data } = await apiClient.post(
        "/api/v1/marketplace/templates",
        payload
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      qc.invalidateQueries({ queryKey: ["my-templates"] });
    },
  });
}

export function useMyTemplates() {
  return useQuery<MarketplaceTemplate[]>({
    queryKey: ["my-templates"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/marketplace/my-templates");
      return data;
    },
  });
}

export function useMarketplaceEarnings() {
  return useQuery<EarningsResponse>({
    queryKey: ["marketplace-earnings"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/marketplace/earnings");
      return data;
    },
  });
}
