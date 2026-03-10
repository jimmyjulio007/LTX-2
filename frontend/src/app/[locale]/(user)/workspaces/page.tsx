import { getTranslations } from "next-intl/server";
import { WorkspacesContent } from "./WorkspacesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Workspace" });
  return {
    title: t("metaTitle"),
  };
}

export default async function WorkspacesPage() {
  const t = await getTranslations("Workspace");

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="gradient-text text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-400">{t("subtitle")}</p>
        </div>

        <WorkspacesContent />
      </div>
    </div>
  );
}
