import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
// import { ShowcaseSection } from "@/components/landing/showcase-section";
import { HowItWorks } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";

import type { Locale } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";
import { i18n } from "@/config/i18n-config";
import { buildAlternates, resolveOgImage, resolveTwitterImage } from "@/lib/seo";
import { getConfiguredAIProvider } from "@/ai";
import { NEW_USER_GIFT } from "@/config/pricing-user";

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

interface PageMetadataProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: PageMetadataProps) {
  const { locale } = await params;

  const titles = {
    en: "Cinematic AI Video Generator for Text & Images",
    zh: "电影感 AI 视频生成器，支持文生视频与图生视频",
  };

  const descriptions = {
    en: `Genclip is an AI video generator for cinematic text-to-video and image-to-video creation. Powered by Seedance 2.0 and 1.5 Pro. Start free with ${NEW_USER_GIFT.credits} credits.`,
    zh: `Genclip 是一款电影感 AI 视频生成器，支持文生视频与图生视频，由 Seedance 2.0 和 1.5 Pro 驱动，注册即可获得 ${NEW_USER_GIFT.credits} 个免费积分。`,
  };
  const keywords = {
    en: [
      "Genclip",
      "AI video generator",
      "text to video AI",
      "image to video generator",
      "cinematic AI videos",
      "Seedance 2.0",
      "Seedance 1.5 Pro",
    ],
    zh: [
      "Genclip",
      "AI 视频生成器",
      "文生视频",
      "图生视频",
      "电影感 AI 视频",
      "Seedance 2.0",
      "Seedance 1.5 Pro",
    ],
  };

  const canonicalUrl = `${siteConfig.url}${locale === i18n.defaultLocale ? "" : `/${locale}`}`;
  const alternates = buildAlternates("/", locale);
  const ogImage = resolveOgImage();
  const twitterImage = resolveTwitterImage();
  const pageTitle = titles[locale] || titles.en;
  const pageDescription = descriptions[locale] || descriptions.en;
  const pageKeywords = keywords[locale] || keywords.en;
  const socialTitles = {
    en: "Genclip - AI Video Generator for Cinematic Text & Image to Video",
    zh: "Genclip - 电影感 AI 视频生成器，支持文生视频与图生视频",
  };
  const socialDescriptions = {
    en: `Turn text prompts and images into cinematic AI videos with Genclip. Powered by Seedance 2.0 and 1.5 Pro. Start free with ${NEW_USER_GIFT.credits} credits.`,
    zh: `用 Genclip 将文本提示词和图片快速生成电影感 AI 视频，由 Seedance 2.0 与 1.5 Pro 驱动，注册即可获得 ${NEW_USER_GIFT.credits} 个免费积分。`,
  };
  const socialTitle = socialTitles[locale] || socialTitles.en;
  const socialDescription = socialDescriptions[locale] || socialDescriptions.en;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: locale === "zh" ? "Genclip 首页 Open Graph 分享图" : "Genclip homepage Open Graph preview",
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: twitterImage
        ? [
            {
              url: twitterImage,
              alt: locale === "zh" ? "Genclip 首页 Twitter 分享图" : "Genclip homepage Twitter card preview",
            },
          ]
        : undefined,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  return (
    <>
      <HeroSection currentProvider={getConfiguredAIProvider()} />
      {/* <ShowcaseSection /> */}
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <CTASection />
      <FAQSection />
    </>
  );
}
