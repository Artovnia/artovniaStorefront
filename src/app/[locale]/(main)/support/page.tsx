import { SupportTicketSection } from "@/components/sections/SupportTicketSection"
import { retrieveCustomer } from "@/lib/data/cookies"

export default async function SupportPage() {
  const customer = await retrieveCustomer()

  return (
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
  )
}