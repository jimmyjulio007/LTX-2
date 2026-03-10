"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "../api/use-developer";

export function ApiKeyManager() {
  const t = useTranslations("Developer");
  const { data: keys, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();

  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    const result = await createMutation.mutateAsync({ name: newKeyName.trim() });
    setRevealedKey(result.api_key);
    setNewKeyName("");
  };

  const handleCopy = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeRevealModal = () => {
    setRevealedKey(null);
    setShowCreate(false);
    setCopied(false);
  };

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
        <h2 className="text-lg font-semibold text-white">{t("apiKeys")}</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
        >
          {t("createKey")}
        </button>
      </div>

      {/* Key list */}
      <div className="space-y-3">
        {keys && keys.length === 0 && (
          <p className="text-sm text-slate-500">{t("noKeys")}</p>
        )}

        {keys?.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{key.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    key.is_active
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {key.is_active ? t("active") : t("revoked")}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="font-mono">{key.key_prefix}...****</span>
                <span>
                  {t("requests")}: {key.total_requests}
                </span>
                {key.last_used_at && (
                  <span>
                    {t("lastUsed")}: {new Date(key.last_used_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {key.is_active && (
              <button
                onClick={() => revokeMutation.mutate(key.id)}
                disabled={revokeMutation.isPending}
                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
              >
                {t("revoke")}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && !revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">{t("createKey")}</h3>

            <div>
              <label className="mb-1 block text-xs text-slate-400">{t("keyName")}</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t("keyNamePlaceholder")}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowCreate(false); setNewKeyName(""); }}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newKeyName.trim()}
                className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? t("creating") : t("create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revealed key modal */}
      {revealedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">{t("keyCreated")}</h3>

            <p className="text-sm text-slate-400">{t("keyCreatedDesc")}</p>

            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-x-auto rounded-lg bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-[#eab308] border border-white/[0.08]">
                {revealedKey}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-lg bg-[#eab308]/20 px-4 py-2.5 text-sm text-[#eab308] transition-colors hover:bg-[#eab308]/30 cursor-pointer"
              >
                {copied ? t("copied") : t("copy")}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeRevealModal}
                className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
              >
                {t("done")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
