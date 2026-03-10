"use client";

import { useTranslations } from "next-intl";
import { signOut } from "@/shared/lib/auth-client";
import { getDisplayName, getInitials, type User } from "@/shared/lib/auth-client";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useToast } from "@/shared/ui/toast";
import { SocialAccountList } from "@/features/social/ui/SocialAccountList";

const QuickActionCard = ({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) => (
  <Link
    href={href}
    className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-[#eab308]/20 hover:bg-white/[0.04] transition-all duration-300"
  >
    <div className="w-10 h-10 rounded-xl bg-[#eab308]/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-white font-bold mb-1">{title}</h3>
    <p className="text-slate-500 text-sm">{desc}</p>
  </Link>
);

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);

const VideoIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
  </svg>
);

const FilmIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
  </svg>
);

const StoreIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
  </svg>
);

const TimelineIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function DashboardContent({ user }: { user: User }) {
  const t = useTranslations("Dashboard");
  const tToast = useTranslations("Toast");
  const router = useRouter();
  const { success } = useToast();
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  const handleSignOut = async () => {
    await signOut();
    success(tToast("signedOut"));
    router.push("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)]">
            <span className="text-xl font-black text-black">{initials}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t("welcome", { name: displayName })}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <StatCard label={t("credits")} value={(user as any).credits ?? 0} />
        <StatCard label={t("videosThisMonth")} value="—" />
        <StatCard label={t("totalViews")} value="—" />
        <StatCard label={t("earnings")} value="—" />
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-lg font-black tracking-tight mb-4">{t("quickActions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard icon={<VideoIcon />} title={t("createVideo")} desc={t("createVideoDesc")} href="/dashboard" />
          <QuickActionCard icon={<MegaphoneIcon />} title={t("adFactory")} desc={t("adFactoryDesc")} href="/ads" />
          <QuickActionCard icon={<FilmIcon />} title={t("scriptStudio")} desc={t("scriptStudioDesc")} href="/script-studio" />
          <QuickActionCard icon={<StoreIcon />} title={t("marketplace")} desc={t("marketplaceDesc")} href="/marketplace" />
        </div>
      </div>

      {/* Second row of actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <QuickActionCard icon={<TimelineIcon />} title={t("timeline")} desc={t("timelineDesc")} href="/projects" />
        <QuickActionCard icon={<CodeIcon />} title={t("developer")} desc={t("developerDesc")} href="/developer" />
        <QuickActionCard icon={<UserGroupIcon />} title={t("workspaces")} desc={t("workspacesDesc")} href="/workspaces" />
        <QuickActionCard icon={<GearIcon />} title={t("settings")} desc={t("settingsDesc")} href="/settings" />
      </div>

      {/* Social Accounts */}
      <div className="mb-12 pt-8 border-t border-white/[0.06]">
        <div className="max-w-xl">
          <SocialAccountList />
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-8 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="text-sm text-slate-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
        >
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
