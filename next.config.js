/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // ОБЯЗАТЕЛЬНО для статического экспорта
  trailingSlash: true,        // ОБЯЗАТЕЛЬНО для TimeWeb Cloud
  images: {
    unoptimized: true,        // ОБЯЗАТЕЛЬНО для статического экспорта
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
  // Настройки для Telegram Mini App
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
