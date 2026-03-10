"use client";

import { useTranslations } from "next-intl";
import { Footer } from "@/widgets/footer/ui/Footer";

export default function PrivacyContent() {
  const t = useTranslations("Privacy");

  return (
    <>
      <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#eab308] mb-4">
            {t("badge")}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-slate-500 text-sm">
            {t("lastUpdated")}
          </p>
        </header>

        <div className="space-y-10 text-slate-400 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("collection.title")}</h2>
            <p>{t("collection.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("usage.title")}</h2>
            <p>{t("usage.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("sharing.title")}</h2>
            <p>{t("sharing.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("cookies.title")}</h2>
            <p>{t("cookies.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("security.title")}</h2>
            <p>{t("security.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("retention.title")}</h2>
            <p>{t("retention.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("rights.title")}</h2>
            <p>{t("rights.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("children.title")}</h2>
            <p>{t("children.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("changes.title")}</h2>
            <p>{t("changes.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("contact.title")}</h2>
            <p>{t("contact.content")}</p>
          </section>
        </div>
      </article>
      <Footer />
    </>
  );
}
