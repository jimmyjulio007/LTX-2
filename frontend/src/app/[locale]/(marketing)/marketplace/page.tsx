import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { MarketplacePageContent } from "./MarketplacePageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketplace" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <MarketplacePageContent locale={locale} />
      </div>
    </div>
  );
}
