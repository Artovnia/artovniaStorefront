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
    // Client-side optimizations
    optimisticClientCache: true,
    // Enable modern bundling
    esmExternals: true,
  },
  
  // Bundle analysis and optimization
  productionBrowserSourceMaps: false,
  
  // Server external packages (moved from experimental)
  serverExternalPackages: [
    '@medusajs/js-sdk',
    'algoliasearch',
  ],
  
  // Advanced webpack optimizations for performance
  webpack: (config, { dev, isServer }) => {
    // Performance optimizations for both dev and prod
    if (!isServer) {
      // Reduce bundle size with better tree shaking
      config.optimization = {
        ...config.optimization,
        // Note: usedExports conflicts with cacheUnaffected in Next.js 15
        // Tree shaking is handled by Next.js internally
        sideEffects: false,
        
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: dev ? 500000 : 200000, // Larger chunks in dev for faster builds
          cacheGroups: {
            // Framework chunk (React, Next.js core)
            framework: {
              test: /[\/]node_modules[\/](react|react-dom|scheduler|next)[\/]/,
              name: 'framework',
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            
            // Medusa SDK - separate chunk for better caching
            medusaSDK: {
              test: /[\/]node_modules[\/]@medusajs[\/]/,
              name: 'medusa-sdk',
              priority: 35,
              chunks: 'all',
              maxSize: 150000,
            },
            
            // Search libraries
            search: {
              test: /[\/]node_modules[\/](algoliasearch|react-instantsearch)[\/]/,
              name: 'search',
              priority: 30,
              chunks: 'all',
              maxSize: 150000,
            },
            
            // UI libraries
            ui: {
              test: /[\/]node_modules[\/](@headlessui|@medusajs\/ui|embla-carousel)[\/]/,
              name: 'ui',
              priority: 25,
              chunks: 'all',
              maxSize: 100000,
            },
            
            // Utilities and smaller libraries
            lib: {
              test: /[\/]node_modules[\/](lodash|clsx|date-fns|uuid)[\/]/,
              name: 'lib',
              priority: 20,
              chunks: 'all',
              maxSize: 80000,
            },
            
            // General vendor chunk for remaining libraries
            vendors: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              maxSize: 120000,
              minChunks: 2,
            },
            
            // Default chunk
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              maxSize: 100000,
            },
          },
        },
      };
    }
    
    // Development optimizations
    if (dev) {
      // Faster builds in development
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
        },
      };
    }
    
    // Module resolution optimizations (removed lodash alias to prevent import conflicts)
    
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
