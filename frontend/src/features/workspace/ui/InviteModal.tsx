"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useInviteMember } from "../api/use-workspace";

interface InviteModalProps {
  workspaceId: string;
  onClose: () => void;
}

const ROLES = ["admin", "editor", "viewer"];

export function InviteModal({ workspaceId, onClose }: InviteModalProps) {
  const t = useTranslations("Workspace");
  const inviteMutation = useInviteMember();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await inviteMutation.mutateAsync({
      workspaceId,
      email: email.trim(),
      role,
    });

    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 space-y-5"
      >
        <h3 className="text-lg font-semibold text-white">{t("inviteMember")}</h3>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t("email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
          />
        </div>

        {/* Role select */}
        <div>
          <label className="mb-1 block text-xs text-slate-400">{t("role")}</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-[#eab308]/40 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r} value={r} className="bg-[#0a0a0a] capitalize">
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          {/* Role descriptions */}
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-slate-600">
              <span className="text-slate-400">{t("adminRole")}:</span> {t("adminRoleDesc")}
            </p>
            <p className="text-[10px] text-slate-600">
              <span className="text-slate-400">{t("editorRole")}:</span> {t("editorRoleDesc")}
            </p>
            <p className="text-[10px] text-slate-600">
              <span className="text-slate-400">{t("viewerRole")}:</span> {t("viewerRoleDesc")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={inviteMutation.isPending || !email.trim()}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {inviteMutation.isPending ? t("inviting") : t("sendInvite")}
          </button>
        </div>

        {inviteMutation.isError && (
          <p className="text-sm text-red-400">{t("inviteError")}</p>
        )}
      </form>
    </div>
  );
}
