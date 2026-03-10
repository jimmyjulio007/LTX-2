"use client";

import { useTranslations } from "next-intl";
import { Footer } from "@/widgets/footer/ui/Footer";

export default function TermsContent() {
  const t = useTranslations("Terms");

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
            <h2 className="text-lg font-bold text-white mb-3">{t("acceptance.title")}</h2>
            <p>{t("acceptance.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("services.title")}</h2>
            <p>{t("services.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("accounts.title")}</h2>
            <p>{t("accounts.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("content.title")}</h2>
            <p>{t("content.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("ip.title")}</h2>
            <p>{t("ip.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("prohibited.title")}</h2>
            <p>{t("prohibited.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("termination.title")}</h2>
            <p>{t("termination.content")}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">{t("liability.title")}</h2>
            <p>{t("liability.content")}</p>
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
