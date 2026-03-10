export type ModerationFlag = "CLEAN" | "FLAGGED" | "BLOCKED" | "PENDING_REVIEW";

export interface ModerationItem {
  id: string;
  prompt: string;
  video_url: string | null;
  moderation_status: ModerationFlag;
  moderation_notes: string | null;
  user_id: string;
  created_at: string;
}

export interface ModerationQueueResponse {
  items: ModerationItem[];
  total: number;
  limit: number;
  offset: number;
}
