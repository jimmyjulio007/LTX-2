"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Image from "next/image";
import { Globe, User, Bell, Gift, LogOut, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { signOut, getInitials, getDisplayName, type User as UserType } from "@/shared/lib/auth-client";
import { useToast } from "@/shared/ui/toast";
import { NotificationPreferences } from "@/features/settings/ui/NotificationPreferences";
import { ReferralWidget } from "@/features/referral/ui/ReferralWidget";

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  fr: "Français",
};

export default function SettingsContent({ user }: { user: UserType }) {
  const t = useTranslations("Settings");
  const tToast = useTranslations("Toast");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { success } = useToast();
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  const handleLocaleSwitch = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as (typeof routing.locales)[number] });
  };

  const handleSignOut = async () => {
    await signOut();
    success(tToast("signedOut"));
    router.push("/login");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto w-full space-y-8">
      <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>

      {/* Profile Card */}
      <Link
        href="/profile"
        className="glass-card p-5 flex items-center gap-4 hover:border-[#eab308]/20 transition-colors group"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl object-cover border border-white/[0.08]"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center">
            <span className="text-sm font-black text-black">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 group-hover:text-[#eab308] transition-colors">
          <User className="w-4 h-4" />
          <span className="text-xs font-medium">{t("editProfile")}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>

      {/* Language */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#eab308]" />
          <h2 className="text-lg font-semibold text-white">{t("language")}</h2>
        </div>
        <p className="text-xs text-slate-500">{t("languageDesc")}</p>

        <div className="grid grid-cols-2 gap-3">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleSwitch(loc)}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                loc === locale
                  ? "text-[#eab308] border-[#eab308]/30 bg-[#eab308]/[0.06] shadow-[0_0_20px_rgba(234,179,8,0.08)]"
                  : "text-slate-400 border-white/[0.06] bg-white/[0.02] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Globe className="w-4 h-4" />
              {LOCALE_NAMES[loc]}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <NotificationPreferences />

      {/* Referral */}
      <ReferralWidget />

      {/* Sign Out */}
      <section className="glass-card p-5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full text-left text-sm text-slate-400 hover:text-red-400 font-medium transition-colors cursor-pointer py-1"
        >
          <LogOut className="w-4 h-4" />
          {t("signOut")}
        </button>
      </section>
    </div>
  );
}
