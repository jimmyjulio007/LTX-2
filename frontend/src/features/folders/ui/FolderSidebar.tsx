"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFolders, useCreateFolder, useDeleteFolder, useRenameFolder } from "../api/use-folders";
import { FolderCreateDialog } from "./FolderCreateDialog";

interface FolderSidebarProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function FolderSidebar({ selectedFolderId, onSelectFolder }: FolderSidebarProps) {
  const t = useTranslations("Folders");
  const { data: folders, isLoading } = useFolders();
  const deleteMutation = useDeleteFolder();
  const renameMutation = useRenameFolder();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleRename = (folderId: string) => {
    if (editName.trim()) {
      renameMutation.mutate({ folderId, name: editName.trim() });
      setEditingId(null);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">{t("title")}</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="text-xs text-[#eab308] transition-colors hover:text-[#eab308]/80"
        >
          + {t("create")}
        </button>
      </div>

      {/* All Videos */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          selectedFolderId === null
            ? "bg-[#eab308]/10 text-[#eab308]"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {t("allVideos")}
      </button>

      {/* Folder list */}
      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-600">...</div>
      ) : (
        folders?.map((folder) => (
          <div key={folder.id} className="group flex items-center gap-1">
            {editingId === folder.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(folder.id)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(folder.id)}
                className="flex-1 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white outline-none"
              />
            ) : (
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? "bg-[#eab308]/10 text-[#eab308]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="mr-2">&#128193;</span>
                {folder.name}
              </button>
            )}

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  setEditingId(folder.id);
                  setEditName(folder.name);
                }}
                className="p-1 text-xs text-slate-600 hover:text-white"
                title={t("rename")}
              >
                &#9998;
              </button>
              <button
                onClick={() => {
                  if (confirm(t("confirmDelete"))) {
                    deleteMutation.mutate(folder.id);
                  }
                }}
                className="p-1 text-xs text-slate-600 hover:text-red-400"
                title={t("delete")}
              >
                &#128465;
              </button>
            </div>
          </div>
        ))
      )}

      {showCreate && (
        <FolderCreateDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
