import { getTranslations } from "next-intl/server";
import { GalleryGrid } from "@/features/gallery/ui/GalleryGrid";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });
  return {
    title: `${t("title")} ${t("titleAccent")} | LTX-VIDEO`,
    description: t("description"),
  };
}

export default async function GalleryPage() {
  const t = await getTranslations("Gallery");

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t("title")} <span className="gradient-text">{t("titleAccent")}</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400">{t("description")}</p>
        </div>

        {/* Gallery grid */}
        <GalleryGrid />
      </div>
    </div>
  );
}
