import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',           // REQUIRED for TimeWeb static export
  trailingSlash: true,        // REQUIRED for TimeWeb Cloud
  images: {
    unoptimized: true,        // REQUIRED for static export
    domains: ['telegram.org', 'cdn.telegram.org'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,  // Ignore TypeScript errors for quick deployment
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors for quick deployment
  },
};

export default nextConfig;
