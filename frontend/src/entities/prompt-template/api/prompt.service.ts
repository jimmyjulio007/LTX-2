import { apiClient } from "@/shared/api/api-client";
import type {
  PromptTemplate,
  EnhancePromptRequest,
  EnhancedPromptResponse,
} from "../model/types";

export async function enhancePrompt(
  data: EnhancePromptRequest,
): Promise<EnhancedPromptResponse> {
  const { data: result } = await apiClient.post("/prompts/enhance", data);
  return result;
}

export async function getTemplates(
  category?: string,
): Promise<PromptTemplate[]> {
  const { data } = await apiClient.get("/prompts/templates", {
    params: category ? { category } : {},
  });
  return data;
}

export async function getTemplate(id: string): Promise<PromptTemplate> {
  const { data } = await apiClient.get(`/prompts/templates/${id}`);
  return data;
}
