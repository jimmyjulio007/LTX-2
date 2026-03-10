"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SubmitTemplateForm } from "@/features/marketplace/ui/SubmitTemplateForm";
import {
  useMyTemplates,
  useMarketplaceEarnings,
} from "@/features/marketplace/api/use-marketplace";

type Tab = "templates" | "submit" | "earnings";

export function MyTemplatesContent() {
  const t = useTranslations("Marketplace");
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const { data: templates, isLoading: loadingTemplates } = useMyTemplates();
  const { data: earnings, isLoading: loadingEarnings } =
    useMarketplaceEarnings();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            <span className="bg-gradient-to-r from-[#eab308] to-[#facc15] bg-clip-text text-transparent">
              {t("creatorDashboard")}
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("creatorSubheading")}
          </p>
        </div>
        <Link
          href="/marketplace"
          className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          {t("browseMarketplace")}
        </Link>
      </div>

      {/* Earnings summary */}
      {!loadingEarnings && earnings && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("totalEarned")}
            </p>
            <p className="mt-2 text-2xl font-black text-[#eab308]">
              {earnings.total_earned}
              <span className="ml-1 text-sm font-medium text-[#eab308]/60">
                {t("credits")}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("pendingPayout")}
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {earnings.pending_payout}
              <span className="ml-1 text-sm font-medium text-slate-500">
                {t("credits")}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("totalSales")}
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {earnings.total_sales}
            </p>
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="mb-8 flex items-center gap-1 border-b border-white/[0.06] pb-px">
        <button
          onClick={() => setActiveTab("templates")}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "templates"
              ? "border-b-2 border-[#eab308] text-[#eab308]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tabMyTemplates")}
          {templates && templates.length > 0 && (
            <span className="ml-2 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">
              {templates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("submit")}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "submit"
              ? "border-b-2 border-[#eab308] text-[#eab308]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tabSubmit")}
        </button>
        <button
          onClick={() => setActiveTab("earnings")}
          className={`rounded-t-lg px-5 py-2.5 text-sm font-bold transition-all ${
            activeTab === "earnings"
              ? "border-b-2 border-[#eab308] text-[#eab308]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {t("tabEarnings")}
        </button>
      </div>

      {/* My Templates list */}
      {activeTab === "templates" && (
        <div>
          {loadingTemplates && (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 rounded-lg bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-white/[0.06]" />
                      <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingTemplates && templates && templates.length > 0 && (
            <div className="space-y-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1]"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                    {tpl.thumbnail_url ? (
                      <Image
                        src={tpl.thumbnail_url}
                        alt={tpl.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-5 w-5 text-slate-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium text-white">
                        {tpl.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          tpl.is_approved
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {tpl.is_approved ? t("approved") : t("pending")}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {tpl.category} &middot; {tpl.price_credits}{" "}
                      {t("credits")} &middot; {tpl.total_sales} {t("sales")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingTemplates && (!templates || templates.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
              <svg
                className="mb-4 h-12 w-12 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="mb-1 text-sm font-medium text-white">
                {t("noMyTemplates")}
              </p>
              <p className="text-xs text-slate-500">
                {t("noMyTemplatesHint")}
              </p>
              <button
                onClick={() => setActiveTab("submit")}
                className="mt-4 rounded-xl btn-gold px-6 py-2.5 text-xs font-bold shadow-[0_0_30px_rgba(234,179,8,0.15)]"
              >
                {t("submitFirst")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit template form */}
      {activeTab === "submit" && <SubmitTemplateForm />}

      {/* Earnings detail */}
      {activeTab === "earnings" && (
        <div>
          {loadingEarnings && (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="h-4 w-1/3 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          )}

          {!loadingEarnings &&
            earnings &&
            earnings.templates.length > 0 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("template")}
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("salesColumn")}
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("earned")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.templates.map((item) => (
                      <tr
                        key={item.template_id}
                        className="border-b border-white/[0.04] last:border-b-0"
                      >
                        <td className="px-5 py-3 text-sm text-white">
                          {item.name}
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-slate-400">
                          {item.sales}
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-medium text-[#eab308]">
                          {item.earned} {t("credits")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {!loadingEarnings &&
            (!earnings || earnings.templates.length === 0) && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16">
                <svg
                  className="mb-4 h-12 w-12 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mb-1 text-sm font-medium text-white">
                  {t("noEarnings")}
                </p>
                <p className="text-xs text-slate-500">
                  {t("noEarningsHint")}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
