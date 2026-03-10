import { getTranslations } from "next-intl/server";
import { LoraModelsContent } from "./LoraModelsContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LoRA" });
  return {
    title: t("metaTitle"),
  };
}

export default async function LoraPage() {
  const t = await getTranslations("LoRA");

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
        </div>

        <LoraModelsContent />
      </div>
    </div>
  );
}
