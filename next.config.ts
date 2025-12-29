import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["assets.kltn.lol"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://backend.kltn.lol/api/:path*",
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig;

export default nextConfig;
