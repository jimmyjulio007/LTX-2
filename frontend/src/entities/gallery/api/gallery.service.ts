import { apiClient } from "@/shared/api/api-client";
import type { GalleryResponse, ShareVideo, GallerySortOption } from "../model/types";

export async function getPublicVideos(
  sort: GallerySortOption = "recent",
  limit: number = 20,
  offset: number = 0,
): Promise<GalleryResponse> {
  const { data } = await apiClient.get("/gallery/public", {
    params: { sort, limit, offset },
  });
  return data;
}

export async function getPublicVideo(shareId: string): Promise<ShareVideo> {
  const { data } = await apiClient.get(`/gallery/public/${shareId}`);
  return data;
}

export async function toggleLike(jobId: string): Promise<{ liked: boolean; likes_count: number }> {
  const { data } = await apiClient.post(`/gallery/${jobId}/like`);
  return data;
}

export async function changeVisibility(
  jobId: string,
  visibility: string,
): Promise<{ visibility: string; share_id: string }> {
  const { data } = await apiClient.patch(`/gallery/${jobId}/visibility`, null, {
    params: { visibility },
  });
  return data;
}

export async function remixVideo(
  jobId: string,
): Promise<{ prompt: string; negative_prompt: string; width: number; height: number; num_frames: number; frame_rate: number }> {
  const { data } = await apiClient.post(`/gallery/${jobId}/remix`);
  return data;
}
