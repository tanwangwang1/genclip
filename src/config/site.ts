/**
 * Site configuration
 * Central place for website settings, auth providers, and features
 */
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  twitterImage: string;
  links: {
    github?: string;
    twitter?: string;
    discord?: string;
  };
  auth: {
    enableGoogleLogin: boolean;
    enableMagicLinkLogin: boolean;
    defaultProvider: "google" | "email";
  };
  routes: {
    defaultLoginRedirect: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "Genclip",
  description: "Genclip is an AI video generator for cinematic text-to-video and image-to-video creation.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://genclip.studio",
  ogImage: "/og-image.jpg",
  twitterImage: "/twitter-card.jpg",
  links: {},
  auth: {
    enableGoogleLogin: true,
    enableMagicLinkLogin: true,
    defaultProvider: "google",
  },
  routes: {
    defaultLoginRedirect: "/text-to-video",
  },
};

// Helper to get enabled auth providers
export function getEnabledAuthProviders() {
  const providers: string[] = [];
  if (siteConfig.auth.enableGoogleLogin) providers.push("google");
  if (siteConfig.auth.enableMagicLinkLogin) providers.push("email");
  return providers;
}
