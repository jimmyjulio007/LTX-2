import { getTranslations } from "next-intl/server";
import ApiDocsContent from "./ApiDocsContent";

export async function generateMetadata() {
  const t = await getTranslations("ApiDocs");
  return { title: t("metaTitle") };
}

export default function ApiDocsPage() {
  return <ApiDocsContent />;
}
