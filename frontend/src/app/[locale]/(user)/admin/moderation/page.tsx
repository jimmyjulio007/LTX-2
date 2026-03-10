import { getTranslations } from "next-intl/server";
import { ModerationQueue } from "@/features/admin/ui/ModerationQueue";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Moderation" });
  return {
    title: t("metaTitle"),
  };
}

export default function ModerationPage() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ModerationQueue />
      </div>
    </div>
  );
}
