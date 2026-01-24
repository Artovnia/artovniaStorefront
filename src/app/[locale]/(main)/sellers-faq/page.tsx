import { Metadata } from "next"
import React, { Suspense } from "react"
import SellersFAQContent from "@/components/pages/faq/SellersFAQContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ dla Sprzedawców - Najczęściej Zadawane Pytania",
    description: "Odpowiedzi na najczęściej zadawane pytania dotyczące sprzedaży na platformie Artovnia. Dowiedz się jak zacząć sprzedawać, zarządzać produktami i otrzymywać płatności.",
    keywords: [
      'FAQ sprzedawcy',
      'jak sprzedawać',
      'artyści marketplace',
      'prowizja',
      'wypłaty',
      'zarządzanie produktami',
    ].join(', '),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/sellers-faq`,
      languages: {
        'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/sellers-faq`,
        'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/sellers-faq`,
      },
    },
    openGraph: {
      title: "FAQ dla Sprzedawców",
      description: "Odpowiedzi na najczęściej zadawane pytania dotyczące sprzedaży na platformie Artovnia.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/sellers-faq`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: 'summary',
      site: '@artovnia',
      creator: '@artovnia',
      title: 'FAQ dla Sprzedawców',
      description: 'Pytania i odpowiedzi dla sprzedawców',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 259200 // Revalidate every 3 days

export default async function SellersFAQPage() {
  // Generate structured data
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "FAQ dla sprzedawców", path: "/sellers-faq" },
  ])

  // FAQPage schema for sellers
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Jak zostać sprzedawcą na Artovnia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aby zostać sprzedawcą, załóż konto, wypełnij profil sprzedawcy i dodaj swoje pierwsze produkty. Proces weryfikacji trwa do 48 godzin."
        }
      },
      {
        "@type": "Question",
        "name": "Jaka jest prowizja platformy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Artovnia pobiera prowizję od każdej sprzedaży. Szczegółowe informacje o prowizji znajdziesz w panelu sprzedawcy."
        }
      },
      {
        "@type": "Question",
        "name": "Kiedy otrzymam wypłatę?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wypłaty realizowane są cyklicznie co 14 dni na podane konto bankowe. Szczegóły wypłat znajdziesz w panelu sprzedawcy."
        }
      },
      {
        "@type": "Question",
        "name": "Jak dodać nowy produkt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "W panelu sprzedawcy wybierz 'Dodaj produkt', wypełnij formularz ze zdjęciami, opisem, ceną i szczegółami. Produkt zostanie opublikowany po zatwierdzeniu."
        }
      }
    ]
  }

  return (
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            <SellersFAQContent />
          </div>
        </div>
      </Suspense>
    </main>
    </>
  )
}
