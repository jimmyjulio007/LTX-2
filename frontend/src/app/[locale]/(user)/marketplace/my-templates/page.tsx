import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import { MyTemplatesContent } from "./MyTemplatesContent";

export async function generateMetadata() {
  const t = await getTranslations("Marketplace");
  return { title: t("myTemplatesTitle") };
}

export default async function MyTemplatesPage() {
  await requireSession();

  return <MyTemplatesContent />;
}
