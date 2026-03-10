"use client";

import Image from "next/image";
import { Home, FileVideo, FolderOpen, Layers, Settings, HelpCircle, Zap, Layout, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";
import { useSession, getInitials, getDisplayName } from "@/shared/lib/auth-client";

type NavItem = { key: string; icon: LucideIcon; href: string };

const navItems: NavItem[] = [
  { key: "home", icon: Home, href: "/dashboard" },
  { key: "myProjects", icon: FileVideo, href: "/projects" },
  { key: "assets", icon: FolderOpen, href: "/assets" },
  { key: "collections", icon: Layers, href: "/marketplace" },
];

const prefItems: NavItem[] = [
  { key: "settings", icon: Settings, href: "/settings" },
  { key: "support", icon: HelpCircle, href: "/support" },
];

export default function Sidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/[0.06] bg-[#050505] h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center">
            <Layout className="text-black w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight uppercase">
              LTX-<span className="text-[#eab308]">VIDEO</span>
            </span>
            {session?.user && (
              <span className="text-[10px] text-slate-500 font-medium">
                {(session.user as any).credits ?? 0} {t("credits")}
              </span>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ key, icon: Icon, href }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-[#eab308]/10 text-[#eab308] font-semibold"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            )}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{t(key)}</span>
          </Link>
        ))}

        <div className="pt-5 pb-2 px-3">
          <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">
            {t("preferences")}
          </span>
        </div>

        {prefItems.map(({ key, icon: Icon, href }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-[#eab308]/10 text-[#eab308] font-semibold"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            )}
          >
            <Icon className="w-[18px] h-[18px]" />
            <span>{t(key)}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06] space-y-3">
        {session?.user && (
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive("/profile")
                ? "bg-[#eab308]/10 text-[#eab308] font-semibold"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
            )}
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={getDisplayName(session.user)}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover border border-white/[0.08]"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center">
                <span className="text-[8px] font-black text-black">{getInitials(session.user)}</span>
              </div>
            )}
            <span className="truncate">{getDisplayName(session.user)}</span>
          </Link>
        )}
        <Link
          href="/settings#billing"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Zap className="w-4 h-4" />
          {t("upgradePlan")}
        </Link>
      </div>
    </aside>
  );
}
