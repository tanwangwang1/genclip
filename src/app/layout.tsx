import { Inter, Outfit } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";

import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";

import { env } from "@/lib/auth/env.mjs";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { cn } from "@/components/ui";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { PlausibleAnalytics } from "@/components/plausible-provider";
import { i18n } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";
import { NEW_USER_GIFT } from "@/config/pricing-user";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});



export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Genclip",
    "genclip.studio",
    "AI video generator",
    "text to video",
    "image to video",
    "cinematic AI videos",
    "text to video AI",
    "image to video generator",
    "Seedance 2.0",
    "Seedance 1.5 Pro",
    "AI video creation",
    "Seedance",
  ],
  authors: [
    {
      name: siteConfig.name,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Genclip - AI Video Generator for Cinematic Text & Image to Video",
    description:
      "Turn text prompts and images into cinematic AI videos with Genclip. Powered by Seedance workflows for fast, studio-grade results.",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        alt: "Genclip Open Graph social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Genclip - AI Video Generator for Cinematic Text & Image to Video",
    description:
      "Create cinematic AI videos from text or images with Genclip. Fast generation, polished results, and free credits to start.",
    images: [
      {
        url: siteConfig.twitterImage,
        alt: "Genclip Twitter card preview",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  metadataBase: new URL(siteConfig.url),
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isZh = locale.startsWith("zh");
  const softwareDescription = isZh
    ? "Genclip 是一款面向电影感创作的 AI 视频生成器，支持文生视频、图生视频和 Seedance 2.0 / 1.5 Pro 工作流。"
    : "Genclip is an AI video generator for cinematic text-to-video and image-to-video creation powered by Seedance 2.0 and Seedance 1.5 Pro.";
  const softwareOfferDescription = isZh
    ? `免费开始创作，注册即可获得 ${NEW_USER_GIFT.credits} 个积分。`
    : `Start creating free with ${NEW_USER_GIFT.credits} credits included for new users.`;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${siteConfig.url}#website`,
                  name: siteConfig.name,
                  url: siteConfig.url,
                  description: siteConfig.description,
                  inLanguage: ["en", "zh"],
                  publisher: {
                    "@id": `${siteConfig.url}#organization`,
                  },
                },
                {
                  "@type": "Organization",
                  "@id": `${siteConfig.url}#organization`,
                  name: siteConfig.name,
                  url: siteConfig.url,
                  logo: {
                    "@type": "ImageObject",
                    url: `${siteConfig.url}/logo.png`,
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": `${siteConfig.url}#software`,
                  name: siteConfig.name,
                  url: siteConfig.url,
                  applicationCategory: "MultimediaApplication",
                  applicationSubCategory: "AI Video Generator",
                  operatingSystem: "Web",
                  browserRequirements: "Requires a modern web browser",
                  inLanguage: locale,
                  description: softwareDescription,
                  image: `${siteConfig.url}/og.png`,
                  brand: {
                    "@id": `${siteConfig.url}#organization`,
                  },
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: softwareOfferDescription,
                    url: siteConfig.url,
                  },
                  featureList: isZh
                    ? [
                        "文生视频",
                        "图生视频",
                        "电影感 AI 视频生成",
                        "Seedance 2.0 与 Seedance 1.5 Pro",
                      ]
                    : [
                        "Text-to-video generation",
                        "Image-to-video generation",
                        "Cinematic AI video creation",
                        "Seedance 2.0 and Seedance 1.5 Pro workflows",
                      ],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <PlausibleAnalytics />
              <GoogleOneTap
                clientId={env.GOOGLE_CLIENT_ID}
                locale={locale}
                defaultRedirectPath={siteConfig.routes.defaultLoginRedirect}
              />
              {children}
              <Analytics />
              <SpeedInsights />
              <Toaster richColors position="top-right" />
              <TailwindIndicator />
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
