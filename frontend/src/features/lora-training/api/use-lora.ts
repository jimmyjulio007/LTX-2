import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { LoraModel } from "@/entities/video-job/model/types";

export function useLoraModels() {
  return useQuery<LoraModel[]>({
    queryKey: ["lora-models"],
    queryFn: async () => {
      const { data } = await apiClient.get("/lora/models");
      return data;
    },
  });
}

export function useCreateLoraModel() {
  const queryClient = useQueryClient();
  return useMutation<
    LoraModel,
    Error,
    { name: string; trigger_word: string; images: File[] }
  >({
    mutationFn: async ({ name, trigger_word, images }) => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("trigger_word", trigger_word);
      images.forEach((file) => formData.append("images", file));

      const { data } = await apiClient.post("/lora/models", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lora-models"] });
    },
  });
}

export function useDeleteLoraModel() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (modelId) => {
      await apiClient.delete(`/lora/models/${modelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lora-models"] });
    },
  });
}
