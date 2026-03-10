"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  fr: "FR",
};

export function LocaleSwitcherFab() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const nextLocale = locale === "en" ? "fr" : "en";

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      aria-label={t("switchTo", { lang: LOCALE_LABELS[nextLocale] })}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] text-white text-xs font-bold uppercase tracking-widest shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-white/[0.1] hover:border-[#eab308]/30 hover:shadow-[0_8px_32px_rgba(234,179,8,0.1)] transition-all duration-300 cursor-pointer group"
    >
      <Globe className="w-4 h-4 text-[#eab308] group-hover:rotate-180 transition-transform duration-500" />
      <span>{LOCALE_LABELS[nextLocale]}</span>
    </button>
  );
}
