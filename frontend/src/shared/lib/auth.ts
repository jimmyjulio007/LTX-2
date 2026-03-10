import { APIError, betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { i18n } from "@better-auth/i18n";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type Locale = "en" | "fr";

const emailTranslations: Record<Locale, {
  verifySubject: string;
  verifyText: (url: string) => string;
  verifyHtml: (url: string) => string;
  resetSubject: string;
  resetText: (url: string) => string;
  resetHtml: (url: string) => string;
  changeEmailSubject: string;
  changeEmailText: (newEmail: string, url: string) => string;
  changeEmailHtml: (newEmail: string, url: string) => string;
  existingSignupSubject: string;
  existingSignupText: string;
  welcomeSubject: string;
  welcomeText: (name: string) => string;
  welcomeHtml: (name: string) => string;
  deleteSubject: string;
  deleteText: (url: string) => string;
  deleteHtml: (url: string) => string;
}> = {
  en: {
    verifySubject: "Verify your email",
    verifyText: (url) => `Click the link to verify your email: ${url}`,
    verifyHtml: (url) => `<p>Click the link below to verify your email:</p><a href="${url}">${url}</a>`,
    resetSubject: "Reset your password",
    resetText: (url) => `Click the link to reset your password: ${url}`,
    resetHtml: (url) => `<p>Click the link below to reset your password:</p><a href="${url}">${url}</a>`,
    changeEmailSubject: "Approve email change",
    changeEmailText: (newEmail, url) => `Click the link to approve the change to ${newEmail}: ${url}`,
    changeEmailHtml: (newEmail, url) => `<p>Click the link below to approve the change to ${newEmail}:</p><a href="${url}">${url}</a>`,
    existingSignupSubject: "Sign-up attempt with your email",
    existingSignupText: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
    welcomeSubject: "Welcome to LTX-VIDEO",
    welcomeText: (name) => `Hi ${name}, welcome to LTX-VIDEO! Start creating cinematic videos today.`,
    welcomeHtml: (name) => `<p>Hi ${name},</p><p>Welcome to LTX-VIDEO! Start creating cinematic videos today.</p>`,
    deleteSubject: "Verify account deletion",
    deleteText: (url) => `Click the link to verify deletion: ${url}`,
    deleteHtml: (url) => `<p>Click the link below to verify deletion:</p><a href="${url}">${url}</a>`,
  },
  fr: {
    verifySubject: "Vérifiez votre adresse e-mail",
    verifyText: (url) => `Cliquez sur le lien pour vérifier votre e-mail : ${url}`,
    verifyHtml: (url) => `<p>Cliquez sur le lien ci-dessous pour vérifier votre e-mail :</p><a href="${url}">${url}</a>`,
    resetSubject: "Réinitialiser votre mot de passe",
    resetText: (url) => `Cliquez sur le lien pour réinitialiser votre mot de passe : ${url}`,
    resetHtml: (url) => `<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p><a href="${url}">${url}</a>`,
    changeEmailSubject: "Approuver le changement d'e-mail",
    changeEmailText: (newEmail, url) => `Cliquez sur le lien pour approuver le changement vers ${newEmail} : ${url}`,
    changeEmailHtml: (newEmail, url) => `<p>Cliquez sur le lien ci-dessous pour approuver le changement vers ${newEmail} :</p><a href="${url}">${url}</a>`,
    existingSignupSubject: "Tentative d'inscription avec votre e-mail",
    existingSignupText: "Quelqu'un a essayé de créer un compte avec votre adresse e-mail. Si c'était vous, essayez de vous connecter. Sinon, vous pouvez ignorer cet e-mail.",
    welcomeSubject: "Bienvenue sur LTX-VIDEO",
    welcomeText: (name) => `Bonjour ${name}, bienvenue sur LTX-VIDEO ! Commencez à créer des vidéos cinématiques dès maintenant.`,
    welcomeHtml: (name) => `<p>Bonjour ${name},</p><p>Bienvenue sur LTX-VIDEO ! Commencez à créer des vidéos cinématiques dès maintenant.</p>`,
    deleteSubject: "Vérifier la suppression du compte",
    deleteText: (url) => `Cliquez sur le lien pour confirmer la suppression : ${url}`,
    deleteHtml: (url) => `<p>Cliquez sur le lien ci-dessous pour confirmer la suppression :</p><a href="${url}">${url}</a>`,
  },
};

function detectLocale(request?: Request): Locale {
  if (!request) return "en";
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/NEXT_LOCALE=(\w+)/);
  if (match && (match[1] === "fr" || match[1] === "en")) return match[1];
  const acceptLang = request.headers.get("accept-language") || "";
  if (acceptLang.startsWith("fr")) return "fr";
  return "en";
}

function getEmailT(request?: Request) {
  return emailTranslations[detectLocale(request)];
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
      refreshCache: false,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "facebook", "twitter"],
      allowUnlinkingAll: true,
    },
  },
  changeEmail: {
    enabled: true,
    sendChangeEmailConfirmation: async ({ user, newEmail, url, request }: any) => {
      const t = getEmailT(request);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: t.changeEmailSubject,
        text: t.changeEmailText(newEmail, url),
        html: t.changeEmailHtml(newEmail, url),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, request }: any) => {
      const t = getEmailT(request);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: t.verifySubject,
        text: t.verifyText(url),
        html: t.verifyHtml(url),
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    onExistingUserSignUp: async ({ user, request }: any) => {
      const t = getEmailT(request);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: t.existingSignupSubject,
        text: t.existingSignupText,
      });
    },
    async sendResetPassword({ user, url, request }: any) {
      const t = getEmailT(request);
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: t.resetSubject,
        text: t.resetText(url),
        html: t.resetHtml(url),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    twitter: {
      clientId: process.env.X_CLIENT_ID!,
      clientSecret: process.env.X_CLIENT_SECRET!,
    },
  },
  plugins: [
    admin(),
    i18n({
      defaultLocale: "en",
      detection: ["cookie", "header"],
      localeCookie: "NEXT_LOCALE",
      translations: {
        fr: {
          USER_NOT_FOUND: "Utilisateur non trouvé",
          INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
          INVALID_PASSWORD: "Mot de passe invalide",
          INVALID_EMAIL: "Adresse email invalide",
          INVALID_TOKEN: "Jeton invalide ou expiré",
          TOKEN_EXPIRED: "Le jeton a expiré",
          SESSION_EXPIRED: "Session expirée, veuillez vous reconnecter",
          EMAIL_NOT_VERIFIED: "Veuillez vérifier votre adresse email",
          EMAIL_ALREADY_VERIFIED: "L'adresse email est déjà vérifiée",
          EMAIL_MISMATCH: "L'adresse email ne correspond pas",
          EMAIL_CAN_NOT_BE_UPDATED: "L'adresse email ne peut pas être modifiée",
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Un compte existe déjà avec cet email",
          USER_EMAIL_NOT_FOUND: "Aucun compte trouvé avec cet email",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Compte introuvable, essayez une autre méthode de connexion",
          ACCOUNT_NOT_FOUND: "Compte introuvable",
          PASSWORD_TOO_SHORT: "Le mot de passe est trop court",
          PASSWORD_TOO_LONG: "Le mot de passe est trop long",
          PASSWORD_ALREADY_SET: "Le mot de passe est déjà défini",
          PROVIDER_NOT_FOUND: "Fournisseur d'authentification introuvable",
          FAILED_TO_CREATE_USER: "Impossible de créer le compte",
          FAILED_TO_CREATE_SESSION: "Impossible de créer la session",
          FAILED_TO_GET_SESSION: "Impossible de récupérer la session",
          FAILED_TO_UPDATE_USER: "Impossible de mettre à jour le profil",
          FAILED_TO_GET_USER_INFO: "Impossible de récupérer les informations utilisateur",
          FAILED_TO_UNLINK_LAST_ACCOUNT: "Impossible de dissocier le dernier compte lié",
          VERIFICATION_EMAIL_NOT_ENABLED: "L'envoi d'email de vérification n'est pas activé",
          SESSION_NOT_FRESH: "Veuillez vous reconnecter pour effectuer cette action",
        },
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userCount = await prisma.user.count();
          if (userCount === 0) {
            return {
              data: {
                ...user,
                role: "ADMIN",
              },
            };
          }
        },
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;
        if (newSession) {
          const t = getEmailT(ctx.request);
          ctx.context.runInBackground(
            transporter.sendMail({
              from: process.env.SMTP_FROM,
              to: newSession.user.email,
              subject: t.welcomeSubject,
              text: t.welcomeText(newSession.user.name),
              html: t.welcomeHtml(newSession.user.name),
            })
          );
        }
      }
    }),
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        if (user.email.includes("admin")) {
          throw new APIError("BAD_REQUEST", {
            message: "Admin accounts can't be deleted",
          });
        }
      },
      sendDeleteAccountVerification: async ({ user, url, request }: any) => {
        const t = getEmailT(request);
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: t.deleteSubject,
          text: t.deleteText(url),
          html: t.deleteHtml(url),
        });
      },
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: true,
      },
    },
  },
});
