import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import { ScriptStudioContent } from "./ScriptStudioContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ScriptStudio" });
  return {
    title: t("metaTitle"),
  };
}

export default async function ScriptStudioPage() {
  await requireSession();

  return <ScriptStudioContent />;
}
