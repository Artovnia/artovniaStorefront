import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    `/(gb)/:path*`,
    // Allow dots in seller handles (e.g., /sellers/ganna.pottery)
    '/(pl|en)?/sellers/:handle*',
    '/sellers/:handle*',
    // Exclude static files, API routes, and Next.js internals
    '/((?!api|_next|_vercel|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|webmanifest|css|js|woff|woff2|ttf|eot)).*)',
  ],
};
