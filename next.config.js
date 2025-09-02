/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
