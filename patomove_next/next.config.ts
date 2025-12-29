import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/pipeline/:path*',
        destination: 'http://100.120.129.79:3456/:path*'
      }
    ];
  }
};

export default nextConfig;
