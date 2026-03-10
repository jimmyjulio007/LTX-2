import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "@/entities/prompt-template/api/prompt.service";

export function usePromptTemplates(category?: string) {
  return useQuery({
    queryKey: ["prompt-templates", category],
    queryFn: () => getTemplates(category),
  });
}
