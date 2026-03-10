import { getTranslations } from "next-intl/server";
import PrivacyContent from "./PrivacyContent";

export async function generateMetadata() {
  const t = await getTranslations("Privacy");
  return { title: t("metaTitle") };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
