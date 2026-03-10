"use client";

import Image from "next/image";
import { Search, Bell, Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getInitials, type User } from "@/shared/lib/auth-client";

export default function TopBar({ user }: { user: User }) {
  const t = useTranslations("Sidebar");
  const initials = getInitials(user);

  return (
    <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-8 py-4 shrink-0 z-10">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-[#eab308]/50 focus:border-[#eab308]/30 transition-all outline-none"
            placeholder={t("searchPlaceholder")}
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-[#eab308]/10 border border-[#eab308]/20 px-3 py-1.5 rounded-full">
          <Coins className="w-4 h-4 text-[#eab308] mr-2" />
          <span className="text-[#eab308] font-bold text-sm">
            {(user as any).credits ?? 0} {t("credits")}
          </span>
        </div>

        <button className="p-2 text-slate-400 hover:text-[#eab308] transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-white/[0.06] mx-1" />

        <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-sm font-medium text-slate-300">
            {user.name || user.email?.split("@")[0]}
          </span>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || ""}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center">
              <span className="text-[10px] font-black text-black">{initials}</span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
