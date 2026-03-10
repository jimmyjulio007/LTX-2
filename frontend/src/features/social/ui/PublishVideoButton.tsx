"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSocialAccounts, usePublishToSocial } from "../api/use-social-accounts";
import { useToast } from "@/shared/ui/toast";
import { Share2, Loader2 } from "lucide-react";

export const PublishVideoButton = ({ jobId }: { jobId: string }) => {
  const t = useTranslations("Social");
  const { data: accounts } = useSocialAccounts();
  const { mutate: publish, isPending } = usePublishToSocial();
  const { success, error } = useToast();
  const [showOptions, setShowOptions] = useState(false);

  const tiktokAccount = accounts?.find(a => a.provider === 'tiktok');

  const handlePublish = () => {
    if (!tiktokAccount) {
      error(t("noAccountError"));
      return;
    }

    publish({ jobId, socialAccountId: tiktokAccount.id }, {
      onSuccess: () => {
        success(t("publishSuccess"));
        setShowOptions(false);
      },
      onError: () => {
        error(t("publishError"));
      }
    });
  };

  if (!tiktokAccount) return null;

  return (
    <div className="relative">
      <button
        disabled={isPending}
        onClick={handlePublish}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eab308] text-black font-black text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.35-.93v5.03c0 1.25-.2 2.5-.8 3.61-.63 1.14-1.6 2.1-2.73 2.63-1.14.54-2.43.74-3.68.61-1.25-.13-2.43-.58-3.41-1.36-1.04-.83-1.84-1.94-2.28-3.19-.44-1.25-.52-2.58-.23-3.87.29-1.29 1-2.48 2.01-3.37 1.01-.89 2.29-1.41 3.62-1.55 1.35-.14 2.71.04 3.97.58v4.03c-1.14-.54-2.48-.68-3.68-.35-1.21.32-2.19 1.14-2.61 2.22-.43 1.08-.34 2.28.24 3.28.58 1 1.56 1.7 2.65 1.94 1.09.24 2.24.01 3.19-.61.95-.62 1.53-1.63 1.62-2.74l.02-12.13z"/>
          </svg>
        )}
        <span>{t("publishToTikTok")}</span>
      </button>
    </div>
  );
};
