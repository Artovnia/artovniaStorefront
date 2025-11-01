import { Metadata } from "next"
import React, { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { ArrowLeftIcon } from "@/icons"

import { GuestReturnForm } from "@/components/pages/returns"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Zwrot zamówienia - Gość | Artovnia",
    description: "Zgłoś zwrot zamówienia jako gość",
  }
}

export default function GuestReturnPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-instrument-sans"
        >
          <ArrowLeftIcon size={16} className="mr-2" />
          Powrót do strony głównej
        </Link>
      </div>

      <div className="content-container">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3634] mx-auto mb-4"></div>
                <p className="text-gray-600 font-instrument-sans">Ładowanie...</p>
              </div>
            </div>
          }
        >
          <GuestReturnForm />
        </Suspense>
      </div>
    </main>
  )
}
