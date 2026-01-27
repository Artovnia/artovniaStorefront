import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { checkBackendHealth } from './lib/backend-health';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip health check for maintenance page itself and static assets
  if (
    pathname === '/maintenance' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    /\.(jpg|jpeg|png|gif|svg|ico|webp|webmanifest|css|js|woff|woff2|ttf|eot|txt|xml)$/.test(pathname)
  ) {
    return intlMiddleware(request);
  }

  // Check backend health
  const isHealthy = await checkBackendHealth();

  // If backend is down, redirect to maintenance page
  if (!isHealthy) {
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.rewrite(maintenanceUrl);
  }

  // If backend is healthy, continue with normal routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(gb)/:path*',
    '/(pl|en)?/sellers/:handle*',
    '/sellers/:handle*',
    '/((?!api|_next|_vercel|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|webmanifest|css|js|woff|woff2|ttf|eot|txt|xml)).*)',
  ],
};