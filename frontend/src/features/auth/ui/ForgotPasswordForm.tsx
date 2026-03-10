"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { getForgotPasswordSchema, type ForgotPasswordFormData } from "@/shared/lib/schemas/auth";
import { authClient } from "@/shared/lib/auth-client";
import { useToast } from "@/shared/ui/toast";
import { useState, useMemo } from "react";

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tToast = useTranslations("Toast");
  const { success: showSuccess } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordSchema = useMemo(() => getForgotPasswordSchema(tValidation), [tValidation]);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    const { error: authError } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });

    if (authError) {
      setError(authError.message || t("genericError"));
      return;
    }

    showSuccess(tToast("forgotSuccess"), tToast("forgotSuccessDesc"));
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-sm mx-auto w-full text-center">
        <div className="w-16 h-16 bg-[#eab308]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black mb-2 text-white">
          {t("checkEmail")}
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {t("resetLinkSent")}
        </p>
        <Link
          href="/login"
          className="text-[#eab308] font-bold hover:text-[#facc15] transition-colors text-sm"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] mb-2">
        <span className="gradient-text">{t("forgotPasswordTitle")}</span>
      </h1>
      <p className="text-slate-500 text-sm font-medium mb-10">
        {t("forgotPasswordSubtitle")}
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

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl btn-gold text-[12px] shadow-[0_0_30px_rgba(234,179,8,0.15)] cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Spinner />}
            {isSubmitting ? t("sendResetLink") + "..." : t("sendResetLink")}
          </span>
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-slate-500">
        <Link
          href="/login"
          className="text-[#eab308] font-bold hover:text-[#facc15] transition-colors"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
