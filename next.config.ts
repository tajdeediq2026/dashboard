import type { NextConfig } from "next";

const apiHost = (() => {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (!raw || /^(undefined|null)$/i.test(raw)) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return { protocol: parsed.protocol.replace(':', ''), hostname: parsed.hostname, port: parsed.port || undefined };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      ...(apiHost ? [{
        protocol: apiHost.protocol as 'http' | 'https',
        hostname: apiHost.hostname,
        port: apiHost.port,
        pathname: '/uploads/**',
      }] : []),
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7065',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
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
