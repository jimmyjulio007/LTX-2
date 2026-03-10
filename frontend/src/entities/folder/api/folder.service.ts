import { apiClient } from "@/shared/api/api-client";
import type { Folder } from "../model/types";

export async function getFolders(): Promise<Folder[]> {
  const { data } = await apiClient.get("/folders/");
  return data;
}

export async function createFolder(
  name: string,
  parentId?: string,
): Promise<Folder> {
  const { data } = await apiClient.post("/folders/", null, {
    params: { name, parent_id: parentId },
  });
  return data;
}

export async function renameFolder(
  folderId: string,
  name: string,
): Promise<Folder> {
  const { data } = await apiClient.patch(`/folders/${folderId}`, null, {
    params: { name },
  });
  return data;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await apiClient.delete(`/folders/${folderId}`);
}

export async function moveToFolder(
  folderId: string,
  jobIds: string[],
): Promise<void> {
  await apiClient.post(`/folders/${folderId}/move`, { job_ids: jobIds });
}
