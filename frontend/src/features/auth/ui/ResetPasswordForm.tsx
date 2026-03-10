"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { getResetPasswordSchema, type ResetPasswordFormData } from "@/shared/lib/schemas/auth";
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

export default function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Validation");
  const tToast = useTranslations("Toast");
  const { success: showSuccess } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPasswordSchema = useMemo(() => getResetPasswordSchema(tValidation), [tValidation]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError(t("invalidToken"));
      return;
    }
    const { error: authError } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (authError) {
      setError(authError.message || t("genericError"));
      return;
    }

    showSuccess(tToast("resetSuccess"), tToast("resetSuccessDesc"));
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-sm mx-auto w-full text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black mb-2 text-white">
          {t("passwordChanged")}
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {t("passwordChanged")}
        </p>
        <Link
          href="/login"
          className="text-[#eab308] font-bold hover:text-[#facc15] transition-colors text-sm"
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] mb-2">
        <span className="gradient-text">{t("resetPasswordTitle")}</span>
      </h1>
      <p className="text-slate-500 text-sm font-medium mb-10">
        {t("resetPasswordSubtitle")}
      </p>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
            <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
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
            <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>
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
            {isSubmitting ? t("updatePassword") + "..." : t("updatePassword")}
          </span>
        </button>
      </form>
    </div>
  );
}
