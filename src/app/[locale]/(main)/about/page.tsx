import { Metadata } from "next"
import React, { Suspense } from "react"
import AboutUsContent from "@/components/pages/about/AboutUsContent"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "O nas | Artovnia",
    description: "Poznaj historię Artovni - rodzinnej inicjatywy stworzonej z pasji do sztuki, designu i rękodzieła.",
  }
}

export default async function AboutPage() {
  return (
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
            <AboutUsContent />
          </div>
        </div>
      </Suspense>
    </main>
  )
}
