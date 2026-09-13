import type { Metadata } from "next";
export const site = process.env.NEXT_PUBLIC_SITE_URL || "https://reklam.biz";
export const publicPaths = [
  "/",
  "/for-advertisers",
  "/for-publishers",
  "/ad-formats",
  "/help",
  "/privacy",
  "/terms",
];
export function localized(path: string, locale: string) {
  return `${site}${locale === "az" ? "" : `/${locale}`}${path === "/" ? (locale === "az" ? "/" : "") : path}`;
}
export function metadataFor(
  path: string,
  locale: string,
  title: string,
  description: string,
): Metadata {
  const index =
    publicPaths.includes(path) && process.env.NEXT_PUBLIC_INDEXABLE === "true";
  return {
    title: `${title} | Reklam.biz`,
    description,
    robots: { index, follow: index },
    alternates: publicPaths.includes(path)
      ? {
          canonical: localized(path, locale),
          languages: {
            az: localized(path, "az"),
            en: localized(path, "en"),
            ru: localized(path, "ru"),
            "x-default": localized(path, "az"),
          },
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: localized(path, locale),
      siteName: "Reklam.biz",
      type: "website",
      locale: locale === "az" ? "az_AZ" : locale === "ru" ? "ru_RU" : "en_US",
      images: [{ url: "/social.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/social.png"],
    },
  };
}
