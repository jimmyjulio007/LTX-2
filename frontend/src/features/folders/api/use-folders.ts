import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  moveToFolder,
} from "@/entities/folder/api/folder.service";

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: getFolders,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      createFolder(name, parentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
      renameFolder(folderId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });
}

export function useMoveToFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, jobIds }: { folderId: string; jobIds: string[] }) =>
      moveToFolder(folderId, jobIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["folders"] }),
  });
}
