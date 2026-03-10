"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketplaceGrid } from "@/features/marketplace/ui/MarketplaceGrid";

interface MarketplacePageContentProps {
  locale: string;
}

export function MarketplacePageContent({
  locale,
}: MarketplacePageContentProps) {
  const t = useTranslations("Marketplace");

  return (
    <>
      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          <span className="bg-gradient-to-r from-[#eab308] to-[#facc15] bg-clip-text text-transparent">
            {t("heading")}
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">
          {t("subheading")}
        </p>
        <div className="mt-6">
          <Link
            href="/marketplace/my-templates"
            className="inline-flex items-center gap-2 rounded-xl btn-gold px-6 py-3 text-sm font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("sellTemplates")}
          </Link>
        </div>
      </div>

      {/* Grid */}
      <MarketplaceGrid locale={locale} />
    </>
  );
}
