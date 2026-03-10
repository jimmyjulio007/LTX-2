import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthPageShell } from "@/widgets/auth-layout/ui/AuthPageShell";
import SignupForm from "@/features/auth/ui/SignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("createAccount")} | LTX-VIDEO`,
    description: t("signupSubtitle"),
  };
}

export default function SignupPage() {
  return (
    <AuthPageShell
      imageSrc="/images/signup-bg.png"
      imageAlt="Golden creative flow"
      overlayText="Transform your creative vision into cinematic reality."
      minHeight="680px"
    >
      <SignupForm />
    </AuthPageShell>
  );
}
