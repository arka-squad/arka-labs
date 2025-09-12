const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/securite',
        destination: '/beta',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
