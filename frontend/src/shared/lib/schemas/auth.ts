import { z } from "zod";

export const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t("invalidEmail")),
    password: z.string().min(8, t("passwordMin")),
    remember: z.boolean().optional(),
  });

export const getSignupSchema = (t: (key: string) => string) =>
  z
    .object({
      fullName: z.string().min(2, t("nameMin")),
      email: z.email(t("invalidEmail")),
      password: z.string().min(8, t("passwordMin")),
      confirmPassword: z.string(),
      terms: z.literal(true, {
        message: t("acceptTerms"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

export const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.email(t("invalidEmail")),
  });

export const getResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, t("passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsMismatch"),
      path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;
export type SignupFormData = z.infer<ReturnType<typeof getSignupSchema>>;
export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;
export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;
