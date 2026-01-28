import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ToastProvider } from "@/components/providers/ToastProvider"
import Script from "next/script"


// Critical fonts preloaded, others load on-demand
const instrumentSans = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-700.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-500italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-600italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-700italic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-instrument-sans",
  display: "swap",
  preload: true, // Preload critical fonts for faster LCP
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-serif-v5-latin-ext-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-serif-v5-latin-ext-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  preload: true, // Preload critical fonts for faster LCP
  fallback: ['Georgia', 'serif'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | Artovnia',
    default: 'Artovnia - Marketplace Sztuki i Rękodzieła Handmade',
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Zobacz unikalne dzieła sztuki handmade. Kup więcej lub sprzedawać swoje prace. Polityka cookie dostępna.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: '5gtEHPGbUGzbdwDywE6OOu9C8K6ilXCykQO_kSfQqDM',
  },
  other: {
    'preconnect': [
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
      'https://artovnia-medusa.s3.eu-north-1.amazonaws.com',
      'https://o56rau04.apicdn.sanity.io'
    ],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  // Root layout doesn't have locale param - it's in [locale] segment
  const locale = 'pl' // Default locale
  
  // Get backend URL for preconnect
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  
  return (
    <html lang={locale} className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <NextIntlClientProvider messages={messages}>
        <body
          className={`${instrumentSans.className} antialiased bg-primary text-primary`}
        >
          <ToastProvider />
          {children}
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
