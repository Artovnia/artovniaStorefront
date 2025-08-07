import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import React from "react"
import TermsOfUseContent from "@/components/pages/terms/TermsOfUseContent"
import { Footer } from "@/components/organisms/Footer/Footer"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "terms" })

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  } as Metadata
}

export default async function TermsPage() {
  return (
    <>
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
          <TermsOfUseContent />
        </div>
      </div>
      <Footer />
    </>
  )
}
