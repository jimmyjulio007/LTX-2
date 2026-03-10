import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthPageShell } from "@/widgets/auth-layout/ui/AuthPageShell";
import ForgotPasswordForm from "@/features/auth/ui/ForgotPasswordForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("forgotPasswordTitle")} | LTX-VIDEO`,
    description: t("forgotPasswordSubtitle"),
  };
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      imageSrc="/images/login-bg.png"
      imageAlt="Golden cinematic camera"
      overlayText="Cinematic AI video generation for filmmakers and creators."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
