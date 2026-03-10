import { apiClient } from "@/shared/api/api-client";
import type { ModerationQueueResponse } from "../model/types";

export async function getModerationQueue(
  status: string = "FLAGGED",
  limit: number = 20,
  offset: number = 0,
): Promise<ModerationQueueResponse> {
  const { data } = await apiClient.get("/admin/moderation/queue", {
    params: { status, limit, offset },
  });
  return data;
}

export async function reviewJob(
  jobId: string,
  action: "approve" | "reject",
  notes: string = "",
): Promise<{ status: string; moderation_status: string }> {
  const { data } = await apiClient.post(`/admin/moderation/${jobId}`, null, {
    params: { action, notes },
  });
  return data;
}
