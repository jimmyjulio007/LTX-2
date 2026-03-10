"use client";

import { useTranslations } from "next-intl";
import { useSocialAccounts, useLinkSocialAccount } from "../api/use-social-accounts";
import { Loader2, Plus, Unlink, CheckCircle2 } from "lucide-react";

export const SocialAccountList = () => {
  const t = useTranslations("Social");
  const { data: accounts, isLoading } = useSocialAccounts();
  const { link } = useLinkSocialAccount();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#eab308]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white">{t("linkedAccounts")}</h3>
        <p className="text-xs text-slate-500">{t("linkedAccountsDesc")}</p>
      </div>

      <div className="grid gap-3">
        {/* TikTok */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10">
               <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.35-.93v5.03c0 1.25-.2 2.5-.8 3.61-.63 1.14-1.6 2.1-2.73 2.63-1.14.54-2.43.74-3.68.61-1.25-.13-2.43-.58-3.41-1.36-1.04-.83-1.84-1.94-2.28-3.19-.44-1.25-.52-2.58-.23-3.87.29-1.29 1-2.48 2.01-3.37 1.01-.89 2.29-1.41 3.62-1.55 1.35-.14 2.71.04 3.97.58v4.03c-1.14-.54-2.48-.68-3.68-.35-1.21.32-2.19 1.14-2.61 2.22-.43 1.08-.34 2.28.24 3.28.58 1 1.56 1.7 2.65 1.94 1.09.24 2.24.01 3.19-.61.95-.62 1.53-1.63 1.62-2.74l.02-12.13z"/>
               </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">TikTok</p>
              {accounts?.find(a => a.provider === 'tiktok') ? (
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{accounts.find(a => a.provider === 'tiktok')?.username}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">{t("notLinked")}</p>
              )}
            </div>
          </div>
          
          {accounts?.find(a => a.provider === 'tiktok') ? (
            <button className="text-xs text-slate-500 hover:text-red-400 transition-colors">
              <Unlink className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => link('tiktok')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("link")}
            </button>
          )}
        </div>

        {/* Instagram/Meta (Placeholder) */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center border border-white/10">
               <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
               </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-white">Instagram</p>
              <p className="text-xs text-slate-500">{t("comingSoon")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
