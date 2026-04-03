import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  distDir: process.env.DIST_DIR || '.next',
  allowedDevOrigins: ['http://100.89.150.50:3059', '100.89.150.50'],
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
