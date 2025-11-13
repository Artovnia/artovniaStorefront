import { Metadata } from "next"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { Button } from "@/components/atoms"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Zwrot zgłoszony - Gość | Artovnia",
    description: "Twój zwrot został pomyślnie zgłoszony",
  }
}

export const dynamic = 'force-dynamic'

/**
 * Guest Return Success Page
 * Shown after successful guest return request creation
 */
export default async function GuestReturnSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ request_id?: string }>
}) {
  const params = await searchParams
  const requestId = params.request_id

  return (
    <main className="container">
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-[#fff] border border-[#3B3634] rounded-lg p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#3B3634] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="font-instrument-serif text-3xl mb-4 text-[#3B3634]">
              Zwrot zgłoszony!
            </h1>
            
            <p className="text-[#3B3634] font-instrument-sans mb-6">
              Twój wniosek o zwrot został pomyślnie utworzony. Sprzedawca
              rozpatrzy go w ciągu 2-3 dni roboczych.
            </p>

            {requestId && (
              <p className="text-[#3B3634] font-instrument-sans text-sm mb-4">
                Numer zgłoszenia: <strong>{requestId}</strong>
              </p>
            )}

            <p className="text-[#3B3634] font-instrument-sans text-sm mb-8">
              Otrzymasz email z dalszymi instrukcjami na adres podany w zamówieniu.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedClientLink href="/">
                <Button variant="filled" className="w-full sm:w-auto">
                  Powrót do strony głównej
                </Button>
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-instrument-serif text-xl mb-4 text-[#3B3634]">
            Co dalej?
          </h2>
          <ul className="space-y-3 text-gray-700 font-instrument-sans">
            <li className="flex items-start gap-2">
              <span className="text-[#3B3634] mt-1">✓</span>
              <span>Sprzedawca rozpatrzy Twój wniosek w ciągu 2-3 dni roboczych</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B3634] mt-1">✓</span>
              <span>Po zaakceptowaniu otrzymasz email z instrukcjami wysyłki</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B3634] mt-1">✓</span>
              <span>Zwrot pieniędzy zostanie zrealizowany po otrzymaniu przesyłki przez sprzedawcę</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
