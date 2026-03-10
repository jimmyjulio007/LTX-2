"use client";

import { useTranslations } from "next-intl";

interface C2PABadgeProps {
  enabled?: boolean;
  className?: string;
}

export function C2PABadge({ enabled = true, className = "" }: C2PABadgeProps) {
  const t = useTranslations("Watermark");

  if (!enabled) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 ${className}`}
      title={t("c2paTooltip")}
    >
      {/* Shield icon */}
      <svg
        className="h-3.5 w-3.5 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>

      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
        {t("c2paVerified")}
      </span>
    </div>
  );
}
