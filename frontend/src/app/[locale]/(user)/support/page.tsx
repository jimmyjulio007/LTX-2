import { getTranslations } from "next-intl/server";
import SupportContent from "./SupportContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Support" });
  return { title: t("metaTitle") };
}

export default async function SupportPage() {
  return <SupportContent />;
}
