"use client";

import { useTranslations } from "next-intl";
import { useUsageStats, type DailyUsage } from "../api/use-developer";

export function UsageChart() {
  const t = useTranslations("Developer");
  const { data: usage, isLoading } = useUsageStats(14);

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse p-6">
        <div className="h-6 w-48 rounded bg-white/[0.04]" />
        <div className="mt-6 flex items-end gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-white/[0.04]"
              style={{ height: `${Math.random() * 120 + 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Aggregate requests per date
  const dailyMap = new Map<string, number>();
  usage?.forEach((entry: DailyUsage) => {
    const current = dailyMap.get(entry.date) ?? 0;
    dailyMap.set(entry.date, current + entry.requests);
  });

  const days = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, requests]) => ({ date, requests }));

  const maxRequests = Math.max(...days.map((d) => d.requests), 1);

  // Unique key prefixes for the legend
  const keyPrefixes = Array.from(new Set(usage?.map((e) => e.key_prefix) ?? []));

  const BAR_COLORS = [
    "bg-[#eab308]",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("usage")}</h2>

        {keyPrefixes.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {keyPrefixes.map((prefix, i) => (
              <span key={prefix} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-sm ${
                    BAR_COLORS[i % BAR_COLORS.length]
                  }`}
                />
                {prefix}...
              </span>
            ))}
          </div>
        )}
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-slate-500">{t("noUsage")}</p>
      ) : (
        <div className="flex items-end gap-1.5" style={{ height: 180 }}>
          {days.map((day) => {
            const pct = (day.requests / maxRequests) * 100;
            return (
              <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
                {/* Tooltip */}
                <div className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100 text-[10px] text-slate-400 whitespace-nowrap">
                  {day.requests}
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t bg-[#eab308] transition-all group-hover:bg-[#eab308]/80"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />

                {/* Date label */}
                <span className="mt-1 text-[9px] text-slate-600 leading-none">
                  {new Date(day.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-white">
            {days.reduce((s, d) => s + d.requests, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">{t("totalRequests")}</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-[#eab308]">{days.length}</p>
          <p className="text-xs text-slate-500">{t("activeDays")}</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] p-3 text-center">
          <p className="text-lg font-bold text-white">
            {days.length > 0
              ? Math.round(days.reduce((s, d) => s + d.requests, 0) / days.length)
              : 0}
          </p>
          <p className="text-xs text-slate-500">{t("avgPerDay")}</p>
        </div>
      </div>
    </div>
  );
}
