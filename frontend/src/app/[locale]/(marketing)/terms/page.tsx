import { getTranslations } from "next-intl/server";
import TermsContent from "./TermsContent";

export async function generateMetadata() {
  const t = await getTranslations("Terms");
  return { title: t("metaTitle") };
}

export default function TermsPage() {
  return <TermsContent />;
}
