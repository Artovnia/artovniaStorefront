import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import React, { Suspense } from "react"
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
    <div className="min-h-screen bg-[#F4F0EB]">
   
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
              <TermsOfUseContent />
            </div>
          </div>
        </Suspense>
      </main>
      
      <Footer />
    </div>
    
  )
}
