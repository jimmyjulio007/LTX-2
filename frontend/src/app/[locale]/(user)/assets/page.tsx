import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Assets" });
  return { title: t("metaTitle") };
}

export default async function AssetsPage() {
  const t = await getTranslations("Assets");

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
        <p className="text-slate-500 text-sm mt-1">{t("subtitle")}</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-slate-400 text-sm">{t("empty")}</p>
      </div>
    </div>
  );
}
