"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateFolder } from "../api/use-folders";

interface FolderCreateDialogProps {
  onClose: () => void;
  parentId?: string;
}

export function FolderCreateDialog({ onClose, parentId }: FolderCreateDialogProps) {
  const t = useTranslations("Folders");
  const [name, setName] = useState("");
  const createMutation = useCreateFolder();

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(
      { name: name.trim(), parentId },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        placeholder={t("create")}
        className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none border border-white/[0.08] focus:border-[#eab308]/40 transition-colors"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || createMutation.isPending}
          className="rounded-lg bg-[#eab308]/20 px-3 py-1 text-xs text-[#eab308] hover:bg-[#eab308]/30 disabled:opacity-50"
        >
          {t("create")}
        </button>
      </div>
    </div>
  );
}
