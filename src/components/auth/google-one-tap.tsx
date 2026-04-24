"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth/client";

interface GoogleOneTapProps {
  clientId: string;
  locale: string;
  defaultRedirectPath: string;
}

const AUTH_ROUTE_PATTERN = /\/(login|register)$/;
type GoogleCredentialResponse = { credential?: string };
type GooglePromptNotification = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  getNotDisplayedReason?: () => string;
  getSkippedReason?: () => string;
};

export function GoogleOneTap({
  clientId,
  locale,
  defaultRedirectPath,
}: GoogleOneTapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initializedRef = useRef(false);
  const lastPromptKeyRef = useRef<string | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signInInFlightRef = useRef(false);
  const searchParamString = searchParams?.toString() ?? "";

  useEffect(() => {
    const googleApi = (window as Window & { google?: any }).google?.accounts?.id;

    if (!scriptLoaded || !googleApi) return;

    if (session?.user) {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }
      if (googleApi?.cancel) {
        googleApi.cancel();
      }
      lastPromptKeyRef.current = null;
      return;
    }
  }, [scriptLoaded, session?.user]);

  useEffect(() => {
    let isActive = true;

    if (!scriptLoaded || isPending || session?.user || !pathname) {
      return;
    }

    const googleApi = (window as Window & { google?: any }).google?.accounts?.id;
    if (!googleApi) return;

    const initAndPrompt = async () => {
      // Re-check session from server before prompting to avoid showing One Tap
      // to users who are already logged in but client cache hasn't updated yet.
      const freshSession = await authClient.getSession();
      if (!isActive) return;
      if (freshSession?.data?.user) {
        googleApi.cancel?.();
        return;
      }

      const callbackURLFromQuery = searchParams?.get("from");
      const fallbackRedirect = `/${locale}${defaultRedirectPath}`;
      const callbackURL = AUTH_ROUTE_PATTERN.test(pathname)
        ? callbackURLFromQuery ?? fallbackRedirect
        : `${pathname}${searchParamString ? `?${searchParamString}` : ""}`;

      if (!initializedRef.current) {
        googleApi.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          callback: async (response: GoogleCredentialResponse) => {
            if (!response.credential || signInInFlightRef.current) return;

            signInInFlightRef.current = true;
            try {
              const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL,
                idToken: {
                  token: response.credential,
                },
              });

              if (error) {
                console.error("Google One Tap signIn error:", error);
                return;
              }

              googleApi.cancel?.();
              if (AUTH_ROUTE_PATTERN.test(pathname)) {
                router.replace(callbackURL);
              } else {
                router.refresh();
              }
            } catch (error) {
              console.error("Google One Tap signIn exception:", error);
            } finally {
              signInInFlightRef.current = false;
            }
          },
        });
        initializedRef.current = true;
      }

      const promptKey = `${pathname}?${searchParamString}`;
      if (lastPromptKeyRef.current === promptKey) return;

      lastPromptKeyRef.current = promptKey;
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }

      promptTimerRef.current = setTimeout(() => {
        googleApi.cancel?.();
        googleApi.prompt((notification: GooglePromptNotification) => {
          if (notification.isNotDisplayed?.()) {
            console.log(
              "[Google One Tap] not displayed:",
              notification.getNotDisplayedReason?.() ?? "unknown",
            );
          } else if (notification.isSkippedMoment?.()) {
            console.log(
              "[Google One Tap] skipped:",
              notification.getSkippedReason?.() ?? "unknown",
            );
          }
        });
        promptTimerRef.current = null;
      }, 600);
    };

    void initAndPrompt();

    return () => {
      isActive = false;
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
        promptTimerRef.current = null;
      }
    };
  }, [
    clientId,
    defaultRedirectPath,
    isPending,
    locale,
    pathname,
    router,
    scriptLoaded,
    searchParamString,
    session?.user,
  ]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  );
}
