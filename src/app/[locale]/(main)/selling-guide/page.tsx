import { Metadata } from "next"
import React, { Suspense } from "react"
import SellingGuideContent from "@/components/pages/selling-guide/SellingGuideContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Jak Sprzedawać na Artovnia? - Przewodnik dla Artystów",
    description: "Dowiedz się jak zacząć sprzedawać na platformie Artovnia. Kompletny przewodnik dla artystów, projektantów i rękodzielników. Zarejestruj się, dodaj produkty i zacznij zarabiać.",
    keywords: [
      'jak sprzedawać',
      'przewodnik sprzedawcy',
      'dla artystów',
      'marketplace',
      'sprzedaż sztuki online',
      'zostań sprzedawcą',
    ].join(', '),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/selling-guide`,
      languages: {
        'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/selling-guide`,
        'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/selling-guide`,
        'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/selling-guide`,
      },
    },
    openGraph: {
      title: "Jak Sprzedawać na Artovnia? - Przewodnik",
      description: "Kompletny przewodnik dla artystów, projektantów i rękodzielników. Zacznij sprzedawać na Artovnia.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/selling-guide`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: 'summary',
      site: '@artovnia',
      creator: '@artovnia',
      title: 'Przewodnik Sprzedawcy',
      description: 'Przewodnik dla artystów i twórców',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 86400 // Revalidate once per day

export default async function SellingGuidePage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Jak sprzedawać", path: "/selling-guide" },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3634]"></div>
        </div>
      }>
        <div className="w-full py-6 md:py-12">
          <div className="content-container mx-auto px-6 md:px-8 max-w-4xl">
            <div className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-instrument-sans"
              >
                <ArrowLeftIcon size={16} className="mr-2" />
                Powrót do strony głównej
              </Link>
            </div>
            <SellingGuideContent />
          </div>
        </div>
      </Suspense>
    </main>
    </>
  )
}
