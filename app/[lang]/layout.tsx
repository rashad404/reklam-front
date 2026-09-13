import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { metadataFor } from "@/lib/seo";
type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  if (!["az", "en", "ru"].includes(lang)) return {};
  const path = (await headers()).get("x-reklam-path") || "/";
  const t = await getTranslations({ locale: lang, namespace: "product" });
  const key =
    path === "/"
      ? "home"
      : path.startsWith("/for-advertisers")
        ? "forAdvertisers"
        : path.startsWith("/for-publishers")
          ? "forPublishers"
          : path.startsWith("/ad-formats")
            ? "formats"
            : path.startsWith("/help")
              ? "help"
              : path.startsWith("/privacy")
                ? "privacy"
                : path.startsWith("/terms")
                  ? "terms"
                  : path.startsWith("/admin")
                    ? "admin"
                    : path.startsWith("/publisher")
                      ? "publisher"
                      : path.startsWith("/settings")
                        ? "settings"
                        : "advertiser";
  return metadataFor(path, lang, t(key), t(`${key}Description`));
}
export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!["az", "en", "ru"].includes(lang)) notFound();
  setRequestLocale(lang);
  const messages = await getMessages({ locale: lang });
  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
