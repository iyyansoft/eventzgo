import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',
      'img.clerk.com',
      'images.clerk.dev',
      'www.gravatar.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;