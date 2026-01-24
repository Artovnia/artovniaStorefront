import { Metadata } from "next"
import React, { Suspense } from "react"
import AboutUsContent from "@/components/pages/about/AboutUsContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"
import {
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/helpers/seo"
import { JsonLd } from "@/components/JsonLd"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "O Nas - Artovnia | Poznaj Naszą Historię i Misję",
    description:
      "Poznaj historię Artovni - rodzinnej inicjatywy stworzonej z pasji do sztuki, designu i rękodzieła. Łączymy artystów z miłośnikami sztuki od 2024 roku.",
    keywords: [
      "o nas",
      "historia Artovnia",
      "misja",
      "marketplace sztuki",
      "polscy artyści",
      "o firmie",
    ].join(", "),
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
      languages: {
        pl: `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
        "x-default": `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
      },
    },
    openGraph: {
      title: "O Nas - Artovnia | Poznaj Naszą Historię",
      description:
        "Poznaj historię Artovni - rodzinnej inicjatywy stworzonej z pasji do sztuki, designu i rękodzieła.",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
      siteName: "Artovnia",
      type: "website",
      locale: "pl_PL",
    },
    twitter: {
      card: "summary",
      site: "@artovnia",
      creator: "@artovnia",
      title: "O Nas - Artovnia",
      description: "Poznaj naszą historię i misję",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const revalidate = 86400

export default async function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "O nas", path: "/about" },
  ])
  const organizationJsonLd = generateOrganizationJsonLd()

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={organizationJsonLd} />

      <main className="min-h-screen">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3634]" />
            </div>
          }
        >
          {/* Back Navigation */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
            <Link
              href="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors font-instrument-sans text-sm group"
            >
              <ArrowLeftIcon
                size={14}
                className="mr-2 group-hover:-translate-x-1 transition-transform"
              />
              Powrót do strony głównej
            </Link>
          </div>

          <AboutUsContent />
        </Suspense>
      </main>
    </>
  )
}