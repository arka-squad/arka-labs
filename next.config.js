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
      // Redirections pour les routes admin manquantes vers les routes existantes
      {
        source: '/cockpit/admin/clients/new',
        destination: '/cockpit/clients/new',
        permanent: false,
      },
      {
        source: '/cockpit/admin/clients/:id',
        destination: '/cockpit/clients/:id',
        permanent: false,
      },
      {
        source: '/cockpit/admin/projects/new',
        destination: '/cockpit/projects/new',
        permanent: false,
      },
      {
        source: '/cockpit/admin/projects/:id',
        destination: '/cockpit/projects/:id',
        permanent: false,
      },
      {
        source: '/cockpit/admin/squads/new',
        destination: '/cockpit/squads/new',
        permanent: false,
      },
      {
        source: '/cockpit/admin/squads/:id',
        destination: '/cockpit/squads/:id',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
