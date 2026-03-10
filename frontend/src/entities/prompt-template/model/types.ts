export interface PromptTemplate {
  id: string;
  name: string;
  name_fr: string;
  category: string;
  prompt_text: string;
  thumbnail_url: string | null;
}

export interface EnhancePromptRequest {
  prompt: string;
  style?: string;
}

export interface EnhancedPromptResponse {
  original: string;
  enhanced: string;
}

export const PROMPT_CATEGORIES = [
  "cinematic",
  "anime",
  "macro",
  "film",
  "abstract",
  "nature",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];
