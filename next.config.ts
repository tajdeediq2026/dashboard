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
  async rewrites() {
    // Route API/backend and uploads through the local Next.js proxy endpoint
    // to avoid CORS and invalid external rewrite validation during build.
    return [
      {
        source: '/api/backend/:path*',
        destination: '/api/proxy/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: '/api/proxy/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
