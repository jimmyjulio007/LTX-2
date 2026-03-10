"use client";

import { useTranslations } from "next-intl";
import { useNotificationPrefs, useUpdateNotificationPrefs } from "../api/use-notification-prefs";

export function NotificationPreferences() {
  const t = useTranslations("Settings");
  const { data: prefs, isLoading } = useNotificationPrefs();
  const updateMutation = useUpdateNotificationPrefs();

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
      </div>
    );
  }

  const toggles = [
    {
      key: "email_on_completion" as const,
      label: t("emailOnCompletion"),
      description: t("emailOnCompletionDesc"),
    },
    {
      key: "email_on_failure" as const,
      label: t("emailOnFailure"),
      description: t("emailOnFailureDesc"),
    },
    {
      key: "email_marketing" as const,
      label: t("emailMarketing"),
      description: t("emailMarketingDesc"),
    },
  ];

  return (
    <div className="glass-card space-y-1 p-6">
      <h2 className="text-lg font-semibold text-white">{t("notifications")}</h2>
      <p className="text-sm text-slate-500">{t("notificationsDesc")}</p>

      <div className="mt-4 space-y-4">
        {toggles.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
            <button
              onClick={() => updateMutation.mutate({ [key]: !prefs?.[key] })}
              disabled={updateMutation.isPending}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                prefs?.[key] ? "bg-[#eab308]" : "bg-white/[0.1]"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  prefs?.[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
