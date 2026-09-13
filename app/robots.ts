import type { MetadataRoute } from "next";
import { site } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: process.env.NEXT_PUBLIC_INDEXABLE === "true" ? "/" : undefined,
      disallow:
        process.env.NEXT_PUBLIC_INDEXABLE === "true" ? ["/api/"] : ["/"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
