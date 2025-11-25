import { Metadata } from "next"
import React, { Suspense } from "react"
import FAQContent from "@/components/pages/faq/FAQContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "FAQ - Najczęściej Zadawane Pytania | Artovnia",
    description: "Odpowiedzi na najczęściej zadawane pytania dotyczące zakupów na platformie Artovnia. Dowiedz się więcej o dostawie, płatnościach, zwrotach i obsłudze klienta.",
    keywords: [
      'FAQ',
      'pytania i odpowiedzi',
      'pomoc',
      'obsługa klienta',
      'jak kupić',
      'dostawa',
      'zwroty',
    ].join(', '),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
      languages: {
        'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/faq`,
        'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/faq`,
        'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
      },
    },
    openGraph: {
      title: "FAQ - Najczęściej Zadawane Pytania | Artovnia",
      description: "Odpowiedzi na najczęściej zadawane pytania dotyczące zakupów na platformie Artovnia.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: 'summary',
      site: '@artovnia',
      creator: '@artovnia',
      title: 'FAQ - Artovnia',
      description: 'Odpowiedzi na najczęściej zadawane pytania',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 3600 // Revalidate every hour

export default async function FAQPage() {
  // Generate structured data
  const breadcrumbJsonLd = await generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "FAQ", path: "/faq" },
  ])

  // FAQPage schema - Google loves this!
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Jak złożyć zamówienie na Artovnia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aby złożyć zamówienie, przeglądaj produkty, dodaj wybrane przedmioty do koszyka i przejdź do płatności. Wypełnij dane dostawy i wybierz metodę płatności."
        }
      },
      {
        "@type": "Question",
        "name": "Jakie metody płatności są dostępne?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Akceptujemy płatności online przez PayU, karty kredytowe i debetowe oraz przelewy bankowe."
        }
      },
      {
        "@type": "Question",
        "name": "Jak długo trwa dostawa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Czas dostawy zależy od wybranej metody. Standardowa dostawa kurierem trwa 2-3 dni robocze, paczkomaty InPost 1-2 dni robocze."
        }
      },
      {
        "@type": "Question",
        "name": "Czy mogę zwrócić produkt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, masz 14 dni na zwrot produktu zgodnie z prawem konsumenckim. Produkt musi być w oryginalnym stanie i opakowaniu."
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
            <FAQContent />
          </div>
        </div>
      </Suspense>
    </main>
    </>
  )
}
