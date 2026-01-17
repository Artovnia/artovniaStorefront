import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  experimental: {
    optimizeCss: true,
    // PERFORMANCE: Tree-shake large packages to reduce bundle size
    // This tells Next.js to optimize imports from these packages
    // Impact: ~50KB bundle reduction
    // NOTE: @medusajs/js-sdk is in serverExternalPackages, so excluded here
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'react-icons',
      '@medusajs/ui',        // NEW: Reduce Medusa UI bundle
      'react-instantsearch', // NEW: Tree-shake Algolia search
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  env: {
    ANALYZE: process.env.ANALYZE,
  },
  
  productionBrowserSourceMaps: false,
  
  serverExternalPackages: [
    '@medusajs/js-sdk',
    'algoliasearch',
  ],
  
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            framework: {
              test: /[\/]node_modules[\/](react|react-dom|next)[\/]/,
              name: 'framework',
              priority: 40,
              chunks: 'all',
              enforce: true,
            },
            algolia: {
              test: /[\/]node_modules[\/](algoliasearch|react-instantsearch)[\/]/,
              name: 'algolia',
              priority: 30,
              chunks: 'all',
              enforce: true,
            },
            medusa: {
              test: /[\/]node_modules[\/]@medusajs[\/]/,
              name: 'medusa',
              priority: 25,
              chunks: 'all',
            },
            vendor: {
              test: /[\/]node_modules[\/]/,
              name: 'vendors',
              priority: 20,
              chunks: 'all',
              maxSize: 150000,
            },
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
  
  async headers() {
    return [
      // SEO: Favicon files with proper caching
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400', // 1 day cache
          },
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
        ],
      },
      {
        source: '/(favicon-16x16.png|favicon-32x32.png|apple-touch-icon.png|android-chrome-192x192.png|android-chrome-512x512.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400', // 1 day cache
          },
        ],
      },
      // SEO: robots.txt file must be served as text/plain
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600',
          },
        ],
      },
      // SEO: ads.txt file must be served as text/plain
      {
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
      // CACHE: Homepage (public data, safe to cache)
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600', // 5min CDN, 1hr stale
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600',
          },
        ],
      },
      
      // CACHE: Static assets (JS, CSS, fonts, etc.)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      
      // CACHE: Product images (can be cached publicly)
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, stale-while-revalidate=86400', // 1 year
          },
        ],
      },
      
      // ✅ CACHE: Product pages (public data, safe to cache)
      {
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400', // 5min CDN, 1day stale
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
      
      // ✅ CACHE: Collections/Browse pages (public data)
      {
        source: '/collections/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400', // 5min CDN
          },
        ],
      },
      
      // ✅ CACHE: Category pages (public data)
      {
        source: '/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=86400',
          },
        ],
      },
      
      // ✅ CACHE: Static content pages
      {
        source: '/(about|how-to-buy|delivery|payment|returns|selling-guide|sellers-faq)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400', // 1hr CDN
          },
        ],
      },
      
      // 🔒 NO CACHE: Checkout pages (user-specific data)
      {
        source: '/checkout/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      
      // 🔒 NO CACHE: Cart page (user-specific data)
      {
        source: '/cart',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      
      // 🔒 NO CACHE: User/Account pages (user-specific data)
      {
        source: '/user/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      
      // 🔒 NO CACHE: Account pages (user-specific data)
      {
        source: '/account/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
      
      // 🔒 NO CACHE: API routes (dynamic data, may be user-specific)
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'no-store',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/o-nas',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/jak-kupowac',
        destination: '/how-to-buy',
        permanent: true,
      },
      {
        source: '/dostawa',
        destination: '/delivery',
        permanent: true,
      },
      {
        source: '/platnosc',
        destination: '/payment',
        permanent: true,
      },
      {
        source: '/zwroty',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/przewodnik-sprzedawcy',
        destination: '/selling-guide',
        permanent: true,
      },
      {
        source: '/faq-sprzedawcy',
        destination: '/sellers-faq',
        permanent: true,
      },
    ]
  },

  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 828, 1200, 1920],
  imageSizes: [80, 160, 252, 370],
  qualities: [60, 65, 75, 85, 90, 100],
    loader: 'default',
    unoptimized: false,
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
        hostname: "artovnia-medusa.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)