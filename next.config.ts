import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  // Add this to help debug environment variables during build
  generateBuildId: async () => {
    console.log('Environment variables during build:');
    console.log('NEXT_PUBLIC_SITE_NAME:', process.env.NEXT_PUBLIC_SITE_NAME);
    console.log('NEXT_PUBLIC_SITE_DESCRIPTION:', process.env.NEXT_PUBLIC_SITE_DESCRIPTION);
    return null; // Use default build ID
  },
  trailingSlash: false,
  reactStrictMode: true,
  // Optimize page loading and navigation
  experimental: {
    // Enable optimistic updates for faster navigation
    optimisticClientCache: true,
  },
  // Optimize server components
  serverExternalPackages: [],
  // Improve performance by disabling unnecessary features in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable React DevTools in development for better performance
      config.resolve.alias['react-dom$'] = 'react-dom/profiling';
      config.resolve.alias['scheduler/tracing'] = 'scheduler/tracing-profiling';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mercur-connect.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.mercurjs.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "api-sandbox.mercurjs.com",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "artovnia-medusa.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
