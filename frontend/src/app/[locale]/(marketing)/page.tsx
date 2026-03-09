import { Hero } from "@/widgets/hero/ui/Hero";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

const Showcase = dynamic(() => import("@/widgets/showcase/ui/Showcase").then(m => m.Showcase));
const Pricing = dynamic(() => import("@/widgets/pricing/ui/Pricing").then(m => m.Pricing));
const Cta = dynamic(() => import("@/widgets/cta/ui/Cta").then(m => m.Cta));
const Footer = dynamic(() => import("@/widgets/footer/ui/Footer").then(m => m.Footer));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ltx-video.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LTX-VIDEO",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      "https://twitter.com/ltxvideo",
      "https://linkedin.com/company/ltx-video",
    ],
    description:
      "AI-powered cinematic video generation platform for filmmakers and creators.",
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LTX-VIDEO",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url: `${BASE_URL}/${locale}`,
    description:
      "Transform text prompts into photorealistic cinematic videos with AI-powered 4K rendering.",
    offers: [
      {
        "@type": "Offer",
        name: "Personal",
        price: "0",
        priceCurrency: "USD",
        description: "5 Render Credits, 1080p Export, Personal Use",
      },
      {
        "@type": "Offer",
        name: "Professional",
        price: "29",
        priceCurrency: "USD",
        description:
          "200 Render Credits, 4K Ultra HD, Commercial License, Priority Queue",
      },
      {
        "@type": "Offer",
        name: "Studio",
        price: "99",
        priceCurrency: "USD",
        description: "Unlimited Credits, Custom Training, Multi-Seat Access",
      },
    ],
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareSchema} />
      <div className="flex flex-col w-full bg-[#050505] relative">
        {/* Film grain overlay */}
        <div className="film-grain" aria-hidden="true" />

        {/* Floating gradient orbs */}
        <div className="gradient-orb gradient-orb-1" aria-hidden="true" />
        <div className="gradient-orb gradient-orb-2" aria-hidden="true" />

        <Hero />
        <div className="section-divider" aria-hidden="true" />
        <Showcase />
        <div className="section-divider" aria-hidden="true" />
        <Pricing />
        <div className="section-divider" aria-hidden="true" />
        <Cta />
        <Footer />
      </div>
    </>
  );
}
