import { SupportTicketSection } from "@/components/sections/SupportTicketSection"
import { retrieveCustomer } from "@/lib/data/cookies"
import { Metadata } from "next"
import { generateBreadcrumbJsonLd } from "@/lib/helpers/seo"

export const metadata: Metadata = {
  title: "Wsparcie Klienta - Pomoc i Kontakt",
  description:
    "Potrzebujesz pomocy? Skontaktuj się z naszym zespołem wsparcia. Wysyłaj zgłoszenia, zadawaj pytania i otrzymuj szybką pomoc dotyczącą zakupów na Artovnia.",
  keywords: [
    "wsparcie",
    "pomoc",
    "kontakt",
    "obsługa klienta",
    "zgłoszenie",
    "pomoc techniczna",
  ].join(", "),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    languages: {
      pl: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
      "x-default": `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    },
  },
  openGraph: {
    title: "Wsparcie Klienta - Pomoc i Kontakt",
    description:
      "Potrzebujesz pomocy? Skontaktuj się z naszym zespołem wsparcia.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
    siteName: "Artovnia",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary",
    site: "@artovnia",
    creator: "@artovnia",
    title: "Wsparcie Klienta",
    description: "Skontaktuj się z naszym zespołem wsparcia",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const revalidate = 3600

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <div className="relative min-h-screen bg-[#F4F0EB] overflow-hidden">
        

        <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
          {/* Header illustration — open letter with paint accents */}
          <div className=" flex justify-center">
            <svg
              className="w-32 h-32 text-[#3B3634]"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Envelope body */}
              <rect
                x="30"
                y="70"
                width="140"
                height="95"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
                fill="#F4F0EB"
                opacity="0.9"
              />
              {/* Envelope flap (open) */}
              <path
                d="M30 73 L100 30 L170 73"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                fill="#F4F0EB"
                opacity="0.85"
              />
              {/* Inner fold lines */}
              <path
                d="M30 70 L100 120 L170 70"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
                opacity="0.3"
              />
              {/* Letter peeking out */}
              <rect
                x="50"
                y="50"
                width="100"
                height="60"
                rx="1"
                stroke="currentColor"
                strokeWidth="1"
                fill="white"
                opacity="0.5"
              />
              {/* Letter lines */}
              <line
                x1="62"
                y1="65"
                x2="138"
                y2="65"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.15"
              />
              <line
                x1="62"
                y1="75"
                x2="130"
                y2="75"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.12"
              />
              <line
                x1="62"
                y1="85"
                x2="120"
                y2="85"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.1"
              />
              {/* Paint accent splashes */}
              <circle
                cx="155"
                cy="55"
                r="8"
                fill="currentColor"
                opacity="0.06"
              />
              <circle
                cx="45"
                cy="145"
                r="6"
                fill="currentColor"
                opacity="0.05"
              />
              <circle
                cx="165"
                cy="150"
                r="4"
                fill="currentColor"
                opacity="0.07"
              />
              {/* Small heart / care icon on the letter */}
              <g opacity="0.2" transform="translate(90, 55)">
                <path
                  d="M10 6C10 3 7.5 1 5 1S0 3 0 6c0 5 5 8 5 8s5-3 5-8z"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              </g>
            </svg>
          </div>

          {/* Decorative brush stroke divider */}
          <div className="flex justify-center mb-6">
            <svg
              className="w-48 h-4 text-[#3B3634]/20"
              viewBox="0 0 300 15"
              fill="none"
            >
              <path
                d="M5 8c40-5 80-3 120 0s80 5 120 1c15-2 30-3 45-1"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl  text-[#3B3634] mb-3 text-center font-instrument-serif font-normal">
            Wsparcie klienta
          </h1>
          <p className="text-lg sm:text-xl text-[#3B3634]/90 mb-12 max-w-7xl mx-auto leading-relaxed text-center font-instrument-sans">
            Jesteśmy tutaj, aby pomóc! Wyślij zgłoszenie, a nasz zespół
            udzieli Ci wsparcia.
          </p>

          <SupportTicketSection
            customerEmail={customer?.email}
            customerName={`${customer?.first_name || ""} ${customer?.last_name || ""}`.trim()}
          />
        </div>
      </div>
    </>
  )
}