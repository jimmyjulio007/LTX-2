import { getTranslations } from "next-intl/server";
import { requireSession } from "@/shared/lib/server-permissions";
import ProfileContent from "./ProfileContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage() {
  const session = await requireSession();
  return <ProfileContent user={session.user} />;
}
