import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';
import { ToastProvider, ToastContainer } from '@/shared/ui/toast';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#050505',
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ltx-video.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SEO' });

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t('siteTitle'),
      template: '%s | LTX-VIDEO',
    },
    description: t('siteDescription'),
    keywords: t('keywords'),
    authors: [{ name: 'LTX AI Visuals' }],
    creator: 'LTX AI Visuals',
    publisher: 'LTX AI Visuals',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      url: `${BASE_URL}/${locale}`,
      siteName: 'LTX-VIDEO',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'LTX-VIDEO - Cinematic AI Video Generation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: [`${BASE_URL}/og-image.png`],
      creator: '@ltxvideo',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'x-default': `${BASE_URL}/en`,
        en: `${BASE_URL}/en`,
        fr: `${BASE_URL}/fr`,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

import { QueryProvider } from '@/shared/api/query-provider';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased selection:bg-primary/30 text-white min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
            </ToastProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
