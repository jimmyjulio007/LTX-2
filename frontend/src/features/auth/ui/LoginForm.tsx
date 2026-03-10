"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { getLoginSchema, type LoginFormData } from "@/shared/lib/schemas/auth";
import { signIn } from "@/shared/lib/auth-client";
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

export default function LoginForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tToast = useTranslations("Toast");
  const { success: showSuccess } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const loginSchema = useMemo(() => getLoginSchema(tValidation), [tValidation]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const searchParams = new URLSearchParams(window.location.search);
    const callbackUrl = searchParams.get("callbackUrl");

    const { error: authError } = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message || t("invalidCredentials"));
      return;
    }

    showSuccess(tToast("loginSuccess"), tToast("loginSuccessDesc"));

    // Handle redirection with locale verification
    if (callbackUrl && callbackUrl.startsWith("/")) {
      // Strip any existing locale prefix to avoid doubling (e.g. /fr/fr/dashboard)
      const cleanPath = callbackUrl.replace(/^\/(en|fr)/, "") || "/";
      router.push(cleanPath);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook" | "twitter") => {
    setSocialLoading(provider);
    const searchParams = new URLSearchParams(window.location.search);
    const callbackUrl = searchParams.get("callbackUrl");

    const locale = window.location.pathname.split("/")[1] || "en";
    const targetPath = callbackUrl || "/dashboard";
    const localizedPath = targetPath.startsWith(`/${locale}`)
      ? targetPath
      : `/${locale}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;

    await signIn.social({
      provider,
      callbackURL: localizedPath,
    });
  };

  const isLoading = isSubmitting || !!socialLoading;

  return (
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] mb-2">
        <span className="gradient-text">{t("loginTitle")}</span>
      </h1>
      <p className="text-slate-500 text-sm font-medium mb-10">
        {t("loginSubtitle")}
      </p>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
            <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400"
            >
              {t("password")}
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-[#eab308]/70 hover:text-[#eab308] transition-colors"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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

        <div className="flex items-center gap-3">
          <input
            id="remember"
            type="checkbox"
            {...register("remember")}
            className="w-4 h-4 rounded border-white/20 bg-white/[0.04] text-[#eab308] focus:ring-[#eab308]/20 focus:ring-offset-0 accent-[#eab308]"
          />
          <label
            htmlFor="remember"
            className="text-sm text-slate-400 font-medium cursor-pointer"
          >
            {t("rememberMe")}
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl btn-gold text-[12px] shadow-[0_0_30px_rgba(234,179,8,0.15)] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Spinner />}
            {isSubmitting ? t("signIn") + "..." : t("signIn")}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === "google" ? <Spinner /> : "Google"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === "facebook" ? <Spinner /> : "Facebook"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSocialLogin("twitter")}
          className="flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-bold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {socialLoading === "twitter" ? <Spinner /> : "X"}
        </button>
      </div>

      <p className="text-center mt-8 text-sm text-slate-500">
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="text-[#eab308] font-bold hover:text-[#facc15] transition-colors"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </div>
  );
}
