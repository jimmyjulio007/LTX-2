import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import { ProjectsPageContent } from "./ProjectsPageContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Timeline" });
  return {
    title: t("projectsTitle"),
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireSession();

  return <ProjectsPageContent locale={locale} />;
}
