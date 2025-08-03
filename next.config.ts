import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  
  // Essential performance optimizations only
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    // Minimal experimental features to reduce complexity
    optimizeCss: true,
  },
  
  // Bundle analysis and optimization
  productionBrowserSourceMaps: false,
  
  // Server external packages
  serverExternalPackages: [
    '@medusajs/js-sdk',
    'algoliasearch',
  ],
  
  // Simplified webpack config to prevent navigation issues
  webpack: (config, { dev, isServer }) => {
    // Minimal webpack optimizations to prevent conflicts
    if (!dev && !isServer) {
      // Only essential optimizations for production client builds
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // Smaller chunks for better loading
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
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
