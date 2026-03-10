"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "../api/use-workspace";

interface WorkspaceSettingsProps {
  workspaceId: string;
}

const PLAN_STYLES: Record<string, string> = {
  free: "bg-white/[0.06] text-slate-400",
  pro: "bg-[#eab308]/20 text-[#eab308]",
  enterprise: "bg-purple-500/20 text-purple-400",
};

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const t = useTranslations("Workspace");
  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  const [name, setName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (workspace) setName(workspace.name);
  }, [workspace]);

  const handleSave = () => {
    if (!name.trim() || name === workspace?.name) return;
    updateMutation.mutate({ workspaceId, name: name.trim() });
  };

  const handleDelete = () => {
    deleteMutation.mutate(workspaceId);
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  if (!workspace) return null;

  const planStyle = PLAN_STYLES[workspace.plan] ?? PLAN_STYLES.free;

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("settings")}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${planStyle}`}
        >
          {workspace.plan}
        </span>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">{t("workspaceName")}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
          />
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || !name.trim() || name === workspace.name}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {updateMutation.isPending ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {/* Plan info */}
      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{t("plan")}</span>
          <span className="font-medium text-white capitalize">{workspace.plan}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{t("created")}</span>
          <span className="text-white">
            {new Date(workspace.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{t("workspaceId")}</span>
          <span className="font-mono text-xs text-slate-400">{workspace.id}</span>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
        <h3 className="text-sm font-medium text-red-400">{t("dangerZone")}</h3>
        <p className="mt-1 text-xs text-slate-500">{t("deleteWarning")}</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-3 rounded-lg border border-red-500/30 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
          >
            {t("deleteWorkspace")}
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30 cursor-pointer"
            >
              {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t("cancel")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
