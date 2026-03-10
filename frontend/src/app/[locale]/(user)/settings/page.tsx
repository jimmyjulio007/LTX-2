import { getTranslations } from "next-intl/server";
import { NotificationPreferences } from "@/features/settings/ui/NotificationPreferences";
import { ReferralWidget } from "@/features/referral/ui/ReferralWidget";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });
  return {
    title: t("metaTitle"),
  };
}

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="gradient-text text-3xl font-bold">{t("title")}</h1>

        <NotificationPreferences />
        <ReferralWidget />
      </div>
    </div>
  );
}
