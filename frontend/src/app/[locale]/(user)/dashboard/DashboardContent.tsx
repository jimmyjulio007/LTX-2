"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { type User } from "@/shared/lib/auth-client";
import { Link } from "@/i18n/routing";
import { Sparkles, Image, SlidersHorizontal, Zap, Video, Clock, HardDrive, Play, History } from "lucide-react";

const stats = [
  { key: "totalGenerated" as const, icon: Video, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "renderingTime" as const, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "storageUsed" as const, icon: HardDrive, color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const mockGenerations = [
  { id: 1, title: "Cinematic drone shot of misty mountain peaks", time: "2h", badge: "4K Render" },
  { id: 2, title: "Cyberpunk cityscape with neon rain reflection", time: "5h", badge: null },
  { id: 3, title: "Abstract liquid gold flowing through space", time: "1d", badge: null },
  { id: 4, title: "Underwater bioluminescent forest at night", time: "2d", badge: null },
  { id: 5, title: "Macro shot of AI robotics eye iris", time: "3d", badge: null },
  { id: 6, title: "Tropical jungle sunrise timelapse", time: "5d", badge: null },
];

export default function DashboardContent({ user }: { user: User }) {
  const t = useTranslations("Dashboard");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <section className="mb-10">
        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-1 shadow-2xl">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 text-lg p-6 resize-none outline-none"
              placeholder={t("promptPlaceholder")}
              rows={3}
            />
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#eab308] transition-colors text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  {t("enhance")}
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#eab308] transition-colors text-sm font-medium">
                  <Image className="w-4 h-4" />
                  {t("imageToVideo")}
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-[#eab308] transition-colors text-sm font-medium">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("advanced")}
                </button>
              </div>
              <button className="bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-lg shadow-[#eab308]/20">
                <Zap className="w-4 h-4" />
                {t("generate")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map(({ key, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06] flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{t(key)}</p>
              <p className="text-2xl font-bold text-white">{t(`${key}Value`)}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{t("recentGenerations")}</h2>
          <Link href="/projects" className="text-[#eab308] text-sm font-semibold hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGenerations.map((gen) => (
            <div
              key={gen.id}
              className="group relative bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden hover:border-[#eab308]/30 transition-all"
            >
              <div className="aspect-video relative overflow-hidden bg-white/[0.02]">
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] flex items-center justify-center text-black shadow-xl shadow-[#eab308]/40 cursor-pointer">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                </div>
                {gen.badge && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                    {gen.badge}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-white mb-1 truncate">{gen.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <History className="w-3 h-3" />
                  {gen.time} {t("ago")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
