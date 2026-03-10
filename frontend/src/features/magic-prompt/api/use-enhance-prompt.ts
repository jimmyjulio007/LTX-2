import { useMutation } from "@tanstack/react-query";
import { enhancePrompt } from "@/entities/prompt-template/api/prompt.service";
import type { EnhancePromptRequest } from "@/entities/prompt-template/model/types";

export function useEnhancePrompt() {
  return useMutation({
    mutationKey: ["enhance-prompt"],
    mutationFn: (data: EnhancePromptRequest) => enhancePrompt(data),
  });
}
