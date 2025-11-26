import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ToastProvider } from "@/components/providers/ToastProvider"


// Critical fonts preloaded, others load on-demand
const instrumentSans = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-sans-v4-latin-ext-regular.woff2",
      weight: "400",
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
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME ||
      'Artovnia - market rękodzieła i sztuki'
    }`,
    default:
      process.env.NEXT_PUBLIC_SITE_NAME ||
      'Artovnia - market rękodzieła i sztuki',
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Artovnia - market rękodzieła i sztuki',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  icons: {
    icon: '/A.svg',
    shortcut: '/A.svg',
    apple: '/A.svg',
    other: {
      rel: 'apple-touch-icon',
      url: '/A.svg',
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const messages = await getMessages()

  const { locale } = await params
  
  // Get backend URL for preconnect
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  
  return (
    <html lang={locale} className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <head>
        {/* ✅ SELF-HOSTED FONTS: Next.js automatically preloads fonts with preload: true */}
        {/* No manual preload needed - Next.js handles it optimally */}
        
        {/* ✅ PRECONNECT: Backend API - Highest Priority (saves 200-400ms) */}
        <link rel="preconnect" href={backendUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={backendUrl} />
        
        {/* ✅ PRECONNECT: AWS S3 Image CDN - High Priority */}
        <link rel="preconnect" href="https://artovnia-medusa.s3.eu-north-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://artovnia-medusa.s3.eu-north-1.amazonaws.com" />
        
        {/* ✅ PRECONNECT: Sanity CDN for Blog Images - Medium Priority */}
        <link rel="preconnect" href="https://o56rau04.apicdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://o56rau04.apicdn.sanity.io" />
      </head>
      <NextIntlClientProvider messages={messages}>
        <body
          className={`${instrumentSans.className} antialiased bg-primary text-primary`}
        >
          <ToastProvider />
          {/* Remove the max-width container here to allow full-width sections */}
          {children}
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
