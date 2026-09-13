import type { MetadataRoute } from "next";
import { localized, publicPaths } from "@/lib/seo";
export default function sitemap(): MetadataRoute.Sitemap {
  return process.env.NEXT_PUBLIC_INDEXABLE === "true"
    ? publicPaths.flatMap((path) =>
        ["az", "en", "ru"].map((locale) => ({
          url: localized(path, locale),
          alternates: {
            languages: {
              az: localized(path, "az"),
              en: localized(path, "en"),
              ru: localized(path, "ru"),
            },
          },
        })),
      )
    : [];
}
