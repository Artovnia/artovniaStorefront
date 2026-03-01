"use client"

import { useEffect } from "react"
import { Link, usePathname } from "@/i18n/routing"
import { reportClientBoundaryError } from "@/lib/telemetry/client-error-reporter"

type SegmentErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MainSegmentError({ error, reset }: SegmentErrorProps) {
  const pathname = usePathname()

  useEffect(() => {
    void reportClientBoundaryError({
      boundary: "route-segment",
      segment: "main",
      pathname: pathname ?? undefined,
      digest: error?.digest,
      message: error?.message,
      stack: error?.stack,
    })
  }, [error, pathname])

  return (
    <main className="container py-16">
      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-red-900">Coś poszło nie tak</h1>
        <p className="mb-6 text-red-800">
          Wystąpił problem podczas ładowania strony. Spróbuj ponownie lub wróć na stronę główną.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-red-700 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-800"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="rounded-md border border-red-300 bg-white px-5 py-2.5 font-medium text-red-800 transition-colors hover:bg-red-100"
          >
            Wróć na stronę główną
          </Link>
        </div>
      </div>
    </main>
  )
}
