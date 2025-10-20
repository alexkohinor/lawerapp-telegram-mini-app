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
};

module.exports = nextConfig;
