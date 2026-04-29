import { redirect } from "next/navigation";
import type { Locale } from "@/config/i18n-config";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/terms-of-service`);
}
