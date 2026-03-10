"use client";

import { useTranslations } from "next-intl";
import { useWorkspaceMembers, useRemoveMember } from "../api/use-workspace";

interface MemberListProps {
  workspaceId: string;
}

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-[#eab308]/20 text-[#eab308]",
  admin: "bg-purple-500/20 text-purple-400",
  editor: "bg-sky-500/20 text-sky-400",
  viewer: "bg-white/[0.06] text-slate-400",
};

export function MemberList({ workspaceId }: MemberListProps) {
  const t = useTranslations("Workspace");
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const removeMutation = useRemoveMember();

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("members")}</h2>
        <span className="text-xs text-slate-500">
          {members?.length ?? 0} {t("membersCount")}
        </span>
      </div>

      <div className="space-y-2">
        {members && members.length === 0 && (
          <p className="text-sm text-slate-500">{t("noMembers")}</p>
        )}

        {members?.map((member) => {
          const roleStyle = ROLE_STYLES[member.role] ?? ROLE_STYLES.viewer;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold text-slate-400">
                  {member.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{member.user_id}</p>
                  <p className="text-xs text-slate-500">
                    {t("joined")}: {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${roleStyle}`}
                >
                  {member.role}
                </span>

                {member.role !== "owner" && (
                  <button
                    onClick={() =>
                      removeMutation.mutate({ workspaceId, memberId: member.id })
                    }
                    disabled={removeMutation.isPending}
                    className="rounded-lg border border-white/[0.06] p-1.5 text-slate-500 transition-colors hover:border-red-500/30 hover:text-red-400 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
