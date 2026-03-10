"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useWorkspaces, useCreateWorkspace } from "@/features/workspace/api/use-workspace";
import { WorkspaceSettings } from "@/features/workspace/ui/WorkspaceSettings";
import { MemberList } from "@/features/workspace/ui/MemberList";
import { InviteModal } from "@/features/workspace/ui/InviteModal";

export function WorkspacesContent() {
  const t = useTranslations("Workspace");
  const { data: workspaces, isLoading } = useWorkspaces();
  const createMutation = useCreateWorkspace();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const workspace = await createMutation.mutateAsync({ name: newName.trim() });
    setSelectedId(workspace.id);
    setNewName("");
    setShowCreate(false);
  };

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace selector */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          {workspaces?.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setSelectedId(ws.id)}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors cursor-pointer ${
                selectedId === ws.id
                  ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                  : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
              }`}
            >
              {ws.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          {t("createWorkspace")}
        </button>
      </div>

      {/* Create workspace inline form */}
      {showCreate && (
        <div className="glass-card flex items-center gap-3 p-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("workspaceNamePlaceholder")}
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
          />
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending || !newName.trim()}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {createMutation.isPending ? t("creating") : t("create")}
          </button>
          <button
            onClick={() => { setShowCreate(false); setNewName(""); }}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
        </div>
      )}

      {/* Selected workspace details */}
      {selectedId && (
        <div className="space-y-6">
          <WorkspaceSettings workspaceId={selectedId} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t("teamMembers")}</h2>
            <button
              onClick={() => setShowInvite(true)}
              className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
            >
              {t("invite")}
            </button>
          </div>

          <MemberList workspaceId={selectedId} />

          {showInvite && (
            <InviteModal
              workspaceId={selectedId}
              onClose={() => setShowInvite(false)}
            />
          )}
        </div>
      )}

      {!selectedId && workspaces && workspaces.length > 0 && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-slate-500">{t("selectWorkspace")}</p>
        </div>
      )}

      {workspaces && workspaces.length === 0 && !showCreate && (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-slate-500">{t("noWorkspaces")}</p>
        </div>
      )}
    </div>
  );
}
