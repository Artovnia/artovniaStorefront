import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  
  // Essential performance optimizations only
  poweredByHeader: false,
  compress: true,
  
  experimental: {
    // Enhanced performance optimizations
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Bundle analysis
  env: {
    ANALYZE: process.env.ANALYZE,
  },
  
  // Enable bundle analyzer when ANALYZE=true
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.plugins.push(
          new (require('@next/bundle-analyzer'))({ enabled: true })
        );
      }
      return config;
    },
  }),
  
  // Bundle analysis and optimization
  productionBrowserSourceMaps: false,
  
  // Server external packages
  serverExternalPackages: [
    '@medusajs/js-sdk',
    'algoliasearch',
  ],
  
  // CRITICAL: Enhanced webpack config for bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Aggressive bundle splitting to reduce 4.2 MB bundles
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Smaller chunks for faster loading
          cacheGroups: {
            // Split React and Next.js core
            framework: {
              test: /[\/]node_modules[\/](react|react-dom|next)[\/]/,
              name: 'framework',
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            // Split Algolia (heavy library)
            algolia: {
              test: /[\/]node_modules[\/](algoliasearch|react-instantsearch)[\/]/,
              name: 'algolia',
              priority: 30,
              chunks: 'all',
              enforce: true,
            },
            // Split MedusaJS
            medusa: {
              test: /[\/]node_modules[\/]@medusajs[\/]/,
              name: 'medusa',
              priority: 25,
              chunks: 'all',
            },
            // Split other vendor libraries
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 20,
              chunks: 'all',
              maxSize: 150000,
            },
            // Common code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  images: {
    // CRITICAL: Enhanced image optimization for faster loading
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
