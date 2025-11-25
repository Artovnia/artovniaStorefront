import { SupportTicketSection } from "@/components/sections/SupportTicketSection"
import { retrieveCustomer } from "@/lib/data/cookies"
import { Metadata } from "next"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export const metadata: Metadata = {
  title: "Wsparcie Klienta - Pomoc i Kontakt | Artovnia",
  description: "Potrzebujesz pomocy? Skontaktuj się z naszym zespołem wsparcia. Wysyłaj zgłoszenia, zadawaj pytania i otrzymuj szybką pomoc dotyczącą zakupów na Artovnia.",
  keywords: [
    'wsparcie',
    'pomoc',
    'kontakt',
    'obsługa klienta',
    'zgłoszenie',
    'pomoc techniczna',
  ].join(', '),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/support`,
      'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/support`,
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    },
  },
  openGraph: {
    title: "Wsparcie Klienta - Pomoc i Kontakt | Artovnia",
    description: "Potrzebujesz pomocy? Skontaktuj się z naszym zespołem wsparcia.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    siteName: "Artovnia",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: 'summary',
    site: '@artovnia',
    creator: '@artovnia',
    title: 'Wsparcie Klienta - Artovnia',
    description: 'Skontaktuj się z naszym zespołem wsparcia',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const revalidate = 3600 // Revalidate every hour

export default async function SupportPage() {
  const customer = await retrieveCustomer()
  
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Wsparcie", path: "/support" },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="flex heading-xl font-normal text-[#3B3634] mb-2 font-instrument-serif items-center justify-center">
          Wsparcie klienta
        </h1>
        <p className="flex text-lg text-[#3B3634] mb-8 font-instrument-sans items-center justify-center text-center">
          Jesteśmy tutaj, aby pomóc! Wyślij zgłoszenie, a nasz zespół udzieli
          Ci wsparcia.
        </p>

        <SupportTicketSection
          customerEmail={customer?.email}
          customerName={`${customer?.first_name || ""} ${customer?.last_name || ""}`.trim()}
        />
      </div>
    </>
  )
}