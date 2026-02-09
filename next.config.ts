import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tajdeediq-001-site1.stempurl.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7065',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
