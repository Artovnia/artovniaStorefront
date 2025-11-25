import { Metadata } from "next"
import React, { Suspense } from "react"
import DeliveryContent from "@/components/pages/delivery/DeliveryContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Formy Dostawy - Paczkomaty, Kurier, Poczta | Artovnia",
    description: "Poznaj dostępne metody dostawy na platformie Artovnia - paczkomaty InPost, kurier DPD/DHL, Poczta Polska. Szybka i bezpieczna dostawa dzieł sztuki.",
    keywords: [
      'dostawa',
      'paczkomaty',
      'kurier',
      'InPost',
      'DPD',
      'DHL',
      'Poczta Polska',
      'wysyłka',
    ].join(', '),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/delivery`,
      languages: {
        'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/delivery`,
        'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/delivery`,
        'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/delivery`,
      },
    },
    openGraph: {
      title: "Formy Dostawy - Paczkomaty, Kurier, Poczta | Artovnia",
      description: "Poznaj dostępne metody dostawy - paczkomaty InPost, kurier DPD/DHL, Poczta Polska.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/delivery`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: 'summary',
      site: '@artovnia',
      creator: '@artovnia',
      title: 'Formy Dostawy - Artovnia',
      description: 'Paczkomaty, kurier, poczta - wybierz najlepszą opcję',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 86400 // Revalidate once per day

export default async function DeliveryPage() {
  const breadcrumbJsonLd = await generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Dostawa", path: "/delivery" },
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
            <DeliveryContent />
          </div>
        </div>
      </Suspense>
    </main>
    </>
  )
}
