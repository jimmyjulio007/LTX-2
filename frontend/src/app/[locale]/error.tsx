"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ServerError");

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-red-500/30 to-red-500/[0.03] bg-clip-text text-transparent select-none">
          {t("title")}
        </p>

        <h1 className="text-2xl sm:text-3xl font-bold text-white -mt-4 mb-3">
          {t("heading")}
        </h1>

        <p className="text-slate-500 text-[15px] mb-8 leading-relaxed">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white border border-white/[0.08] rounded-xl transition-colors"
          >
            {t("backHome")}
          </Link>
        </div>

        <div className="mt-16 flex justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-red-500/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
