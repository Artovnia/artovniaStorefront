import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    optimizeCss: true,
    // Enable modern bundling
    esmExternals: true,
    // Disable optimistic client cache to prevent auth state issues
    // optimisticClientCache: false, // Commented out - this was causing session issues
  },
  
  // Bundle analysis and optimization
  productionBrowserSourceMaps: false,
  
  // Server external packages (moved from experimental)
  serverExternalPackages: [
    '@medusajs/js-sdk',
    'algoliasearch',
  ],
  
  // Simplified webpack optimizations to prevent session/navigation issues
  webpack: (config, { dev, isServer }) => {
    // Only apply minimal optimizations to prevent conflicts
    if (!isServer && !dev) {
      // Production client-side optimizations only
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Keep framework separate
            framework: {
              test: /[\/]node_modules[\/](react|react-dom|scheduler|next)[\/]/,
              name: 'framework',
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            // Medusa SDK separate
            medusaSDK: {
              test: /[\/]node_modules[\/]@medusajs[\/]/,
              name: 'medusa-sdk',
              priority: 35,
              chunks: 'all',
            },
            // Default vendor chunk
            vendors: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              minChunks: 2,
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
