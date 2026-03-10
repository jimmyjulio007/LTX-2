import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { SEO_PAGES } from "@/shared/data/seo-pages";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return SEO_PAGES.flatMap((page) =>
    routing.locales.map((locale) => ({
      locale,
      slug: page.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = SEO_PAGES.find((p) => p.slug === slug);
  if (!page) return {};

  const t = await getTranslations({ locale, namespace: "SEOPages" });

  return {
    title: `${t(`${page.titleKey}.title`)} | LTX-VIDEO`,
    description: t(`${page.titleKey}.description`),
    keywords: page.keywords.join(", "),
    alternates: {
      languages: {
        en: `/en/use-cases/${slug}`,
        fr: `/fr/use-cases/${slug}`,
      },
    },
    openGraph: {
      title: t(`${page.titleKey}.title`),
      description: t(`${page.titleKey}.description`),
      type: "website",
    },
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = SEO_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "SEOPages" });

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          {t(`${page.titleKey}.h1`)}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          {t(`${page.titleKey}.description`)}
        </p>
        <div className="mt-10">
          <Link
            href="/signup"
            className="btn-gold inline-block rounded-xl px-8 py-4 text-lg font-bold"
          >
            {t("cta")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t(`${page.titleKey}.feature${i}Title`)}
              </h3>
              <p className="text-sm text-slate-400">
                {t(`${page.titleKey}.feature${i}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="glass-card p-10">
          <h2 className="gradient-text text-2xl font-bold">{t("ctaTitle")}</h2>
          <p className="mt-3 text-slate-400">{t("ctaDesc")}</p>
          <Link
            href="/signup"
            className="btn-gold mt-6 inline-block rounded-xl px-8 py-3 font-bold"
          >
            {t("cta")}
          </Link>
        </div>
      </section>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "LTX-VIDEO",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web",
            description: t(`${page.titleKey}.description`),
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </div>
  );
}
