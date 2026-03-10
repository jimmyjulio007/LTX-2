"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { signUp, signIn } from "@/shared/lib/auth-client";
import { getSignupSchema, type SignupFormData } from "@/shared/lib/schemas/auth";
import { useToast } from "@/shared/ui/toast";
import { useRouter } from "@/i18n/routing";
import { useState, useMemo } from "react";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function SignupForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tToast = useTranslations("Toast");
  const { success: showSuccess } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const signupSchema = useMemo(() => getSignupSchema(tValidation), [tValidation]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false as unknown as true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const isLoading = isSubmitting || !!socialLoading;

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    const { error: authError } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.fullName,
    });

    if (authError) {
      setError(authError.message || t("genericError"));
      return;
    }

    showSuccess(tToast("signupSuccess"), tToast("signupSuccessDesc"));
    // next-intl useRouter automatically handles the current locale
    router.push("/dashboard");
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    // For social login, we need to provide the full path including locale
    const locale = window.location.pathname.split("/")[1] || "en";
    await signIn.social({
      provider,
      callbackURL: `/${locale}/dashboard`,
    });
  };

  return (
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] mb-2">
        <span className="gradient-text">{t("signupTitle")}</span>
      </h1>
      <p className="text-slate-500 text-sm font-medium mb-10">
        {t("signupSubtitle")}
      </p>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="fullName"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2"
          >
            {t("fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            {...register("fullName")}
            className={cn(
              "w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-300",
              errors.fullName
                ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
                : "border-white/[0.08] focus:border-[#eab308]/40 focus:ring-[#eab308]/20"
            )}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2"
          >
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-300",
              errors.email
                ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
                : "border-white/[0.08] focus:border-[#eab308]/40 focus:ring-[#eab308]/20"
            )}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2"
          >
            {t("password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className={cn(
              "w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-300",
              errors.password
                ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
                : "border-white/[0.08] focus:border-[#eab308]/40 focus:ring-[#eab308]/20"
            )}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2"
          >
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={cn(
              "w-full bg-white/[0.04] border rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-colors duration-300",
              errors.confirmPassword
                ? "border-red-500/60 focus:border-red-500/80 focus:ring-red-500/20"
                : "border-white/[0.08] focus:border-[#eab308]/40 focus:ring-[#eab308]/20"
            )}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1.5">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            {...register("terms")}
            className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/[0.04] text-[#eab308] focus:ring-[#eab308]/20 focus:ring-offset-0 accent-[#eab308]"
          />
          <div>
            <label
              htmlFor="terms"
              className="text-sm text-slate-400 font-medium cursor-pointer"
            >
              {t("agreeTerms")}{" "}
              <Link
                href="/terms"
                className="text-[#eab308] hover:text-[#facc15] transition-colors"
              >
                {t("termsLink")}
              </Link>
            </label>
            {errors.terms && (
              <p className="text-red-400 text-xs mt-1">
                {errors.terms.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl btn-gold text-[12px] shadow-[0_0_30px_rgba(234,179,8,0.15)] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Spinner />}
            {isSubmitting ? t("createAccount") + "..." : t("createAccount")}
          </span>
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
          {t("orContinue")}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialSignup("google")}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === "google" ? <Spinner /> : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </>
          )}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialSignup("github")}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === "github" ? <Spinner /> : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </>
          )}
        </button>
      </div>

      <p className="text-center mt-8 text-sm text-slate-500">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="text-[#eab308] font-bold hover:text-[#facc15] transition-colors"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
