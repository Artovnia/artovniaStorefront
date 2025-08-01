import type { Metadata } from "next"
import { Funnel_Display } from "next/font/google"
import "./globals.css"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ToastProvider } from "@/components/providers/ToastProvider"



const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
    <html lang={locale} className="">
      <NextIntlClientProvider messages={messages}>
        <body
          className={`${funnelDisplay.className} antialiased bg-primary text-secondary`}
        >
        

          <ToastProvider />
          {children}
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
