import type { Metadata } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ToastProvider } from "@/components/providers/ToastProvider"



const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
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
  return (
    <html lang={locale} className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
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
