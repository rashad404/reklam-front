import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = (
      process.env.NEXT_PUBLIC_API_URL || "https://api.reklam.biz/api"
    ).replace(/\/api\/?$/, "");
    return [
      { source: "/serve.js", destination: `${backend}/serve.js` },
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
    ];
  },
  poweredByHeader: false,
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'" +
              (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "") +
              "; style-src 'self' 'unsafe-inline'; img-src 'self' https: http: data: blob:; connect-src 'self' https: http: ws:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
  distDir: process.env.DIST_DIR || ".next",
  allowedDevOrigins: ["http://100.89.150.50:3059", "100.89.150.50"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8059",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "api.reklam.biz",
        pathname: "/storage/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
