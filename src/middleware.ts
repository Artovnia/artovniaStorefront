import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(gb)/:path*',
    '/(pl|en)?/sellers/:handle*',
    '/sellers/:handle*',
    '/((?!api|_next|_vercel|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|webmanifest|css|js|woff|woff2|ttf|eot|txt|xml)).*)',
  ],
};