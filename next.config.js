/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,        // ОБЯЗАТЕЛЬНО для TimeWeb Cloud
  images: {
    domains: ['telegram.org', 'cdn.telegram.org'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize build for production
  generateBuildId: async () => {
    return 'stable-build';
  },
};

module.exports = nextConfig;
