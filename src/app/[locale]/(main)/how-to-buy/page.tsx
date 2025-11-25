import { Metadata } from "next"
import React, { Suspense } from "react"
import HowToBuyContent from "@/components/pages/how-to-buy/HowToBuyContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Jak Kupować na Artovnia? - Przewodnik Zakupów Krok po Kroku | Artovnia",
    description: "Dowiedz się jak dokonywać zakupów na platformie Artovnia. Prosty przewodnik krok po kroku - od wyboru produktu, przez płatność, aż po dostawę.",
    keywords: [
      'jak kupić',
      'przewodnik zakupów',
      'jak zamówić',
      'proces zakupu',
      'płatność',
      'dostawa',
    ].join(', '),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/how-to-buy`,
      languages: {
        'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/how-to-buy`,
        'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/how-to-buy`,
        'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/how-to-buy`,
      },
    },
    openGraph: {
      title: "Jak Kupować na Artovnia? - Przewodnik Zakupów",
      description: "Prosty przewodnik krok po kroku - od wyboru produktu, przez płatność, aż po dostawę.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/how-to-buy`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: 'summary',
      site: '@artovnia',
      creator: '@artovnia',
      title: 'Jak Kupować na Artovnia?',
      description: 'Przewodnik zakupów krok po kroku',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 86400 // Revalidate once per day

export default async function HowToBuyPage() {
  const breadcrumbJsonLd = await generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Jak kupować", path: "/how-to-buy" },
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
              <HowToBuyContent />
            </div>
          </div>
        </Suspense>
      </main>
    </>
  )
}
