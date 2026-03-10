import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthPageShell } from "@/widgets/auth-layout/ui/AuthPageShell";
import ResetPasswordForm from "@/features/auth/ui/ResetPasswordForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("resetPasswordTitle")} | LTX-VIDEO`,
    description: t("resetPasswordSubtitle"),
  };
}

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      imageSrc="/images/login-bg.png"
      imageAlt="Golden cinematic camera"
      overlayText="Cinematic AI video generation for filmmakers and creators."
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
