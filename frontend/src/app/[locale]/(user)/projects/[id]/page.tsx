import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import { ProjectTimelineContent } from "./ProjectTimelineContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Timeline" });
  return {
    title: t("timelineTitle"),
  };
}

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireSession();

  return <ProjectTimelineContent projectId={id} locale={locale} />;
}
