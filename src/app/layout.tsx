import type { Metadata } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ToastProvider } from "@/components/providers/ToastProvider"



const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],  // Added medium, semibold, and bold weights
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"], // Add support for italic style
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
        {/* ✅ PRECONNECT: Backend API - Highest Priority (saves 200-400ms) */}
        <link rel="preconnect" href={backendUrl} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={backendUrl} />
        
        {/* ✅ PRECONNECT: AWS S3 Image CDN - High Priority */}
        <link rel="preconnect" href="https://artovnia-medusa.s3.eu-north-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://artovnia-medusa.s3.eu-north-1.amazonaws.com" />
        
        {/* ✅ PRECONNECT: Sanity CDN for Blog Images - Medium Priority */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        
        {/* ✅ PRECONNECT: Google Fonts - Low Priority (already optimized by Next.js) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
