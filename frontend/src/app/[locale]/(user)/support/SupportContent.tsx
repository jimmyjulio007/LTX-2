"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Mail,
  MessageCircle,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Zap,
  Film,
  CreditCard,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/shared/lib/utils";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left glass-card p-5 transition-colors hover:border-white/[0.1]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white">{question}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200",
            open && "rotate-180 text-[#eab308]"
          )}
        />
      </div>
      {open && (
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">{answer}</p>
      )}
    </button>
  );
}

export default function SupportContent() {
  const t = useTranslations("Support");

  const faqItems = [
    { q: t("faq.generateVideo.q"), a: t("faq.generateVideo.a") },
    { q: t("faq.credits.q"), a: t("faq.credits.a") },
    { q: t("faq.formats.q"), a: t("faq.formats.a") },
    { q: t("faq.processing.q"), a: t("faq.processing.a") },
    { q: t("faq.share.q"), a: t("faq.share.a") },
    { q: t("faq.account.q"), a: t("faq.account.a") },
  ];

  const categories = [
    { icon: Zap, label: t("cat.gettingStarted"), color: "text-[#eab308]", bg: "bg-[#eab308]/10" },
    { icon: Film, label: t("cat.videoGeneration"), color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: CreditCard, label: t("cat.billing"), color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Shield, label: t("cat.accountSecurity"), color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#eab308]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6 text-[#eab308]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">{t("subtitle")}</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="mailto:support@ltx-video.com"
          className="glass-card p-5 flex flex-col items-center text-center gap-3 hover:border-[#eab308]/20 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#eab308]/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#eab308]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t("emailUs")}</p>
            <p className="text-xs text-slate-500 mt-0.5">support@ltx-video.com</p>
          </div>
        </a>

        <a
          href="https://discord.gg/ltxvideo"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card p-5 flex flex-col items-center text-center gap-3 hover:border-[#eab308]/20 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t("discord")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("discordDesc")}</p>
          </div>
        </a>

        <Link
          href="/api-docs"
          className="glass-card p-5 flex flex-col items-center text-center gap-3 hover:border-[#eab308]/20 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t("documentation")}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("documentationDesc")}</p>
          </div>
        </Link>
      </div>

      {/* Help categories */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">{t("helpTopics")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(({ icon: Icon, label, color, bg }) => (
            <div
              key={label}
              className="glass-card p-4 flex flex-col items-center gap-2 text-center"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <span className="text-xs font-medium text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">{t("faqTitle")}</h2>
        <div className="space-y-2">
          {faqItems.map(({ q, a }, i) => (
            <FaqItem key={i} question={q} answer={a} />
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="glass-card p-6 text-center space-y-3">
        <p className="text-sm font-semibold text-white">{t("stillNeedHelp")}</p>
        <p className="text-xs text-slate-500">{t("stillNeedHelpDesc")}</p>
        <a
          href="mailto:support@ltx-video.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" />
          {t("contactSupport")}
        </a>
      </section>
    </div>
  );
}
