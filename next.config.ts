import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8059',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.reklam.biz',
        pathname: '/storage/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
