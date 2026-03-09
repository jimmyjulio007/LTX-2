import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ltx-video.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "fr"];
  const lastModified = new Date();

  const routes = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1.0,
    alternates: {
      languages: {
        en: `${BASE_URL}/en`,
        fr: `${BASE_URL}/fr`,
      },
    },
  }));

  return routes;
}
