import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthPageShell } from "@/widgets/auth-layout/ui/AuthPageShell";
import LoginForm from "@/features/auth/ui/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("signIn")} | LTX-VIDEO`,
    description: t("loginSubtitle"),
  };
}

export default function LoginPage() {
  return (
    <AuthPageShell
      imageSrc="/images/login-bg.png"
      imageAlt="Golden cinematic camera"
      overlayText="Cinematic AI video generation for filmmakers and creators."
    >
      <LoginForm />
    </AuthPageShell>
  );
}
