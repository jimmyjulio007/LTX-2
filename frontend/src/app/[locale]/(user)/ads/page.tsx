import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import { AdsPageContent } from "./AdsPageContent";

export async function generateMetadata() {
  const t = await getTranslations("AdFactory");
  return { title: t("pageTitle") };
}

export default async function AdsPage() {
  await requireSession();

  return <AdsPageContent />;
}
