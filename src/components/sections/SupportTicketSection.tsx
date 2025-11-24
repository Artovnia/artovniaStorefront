"use client"

import React from "react"
import { TicketForm } from "../organisms/TicketForm"

interface SupportTicketSectionProps {
  customerEmail?: string
  customerName?: string
}

export const SupportTicketSection: React.FC<SupportTicketSectionProps> = ({
  customerEmail,
  customerName,
}) => {
  return (
    <div className="w-full">
      <div className="bg-primary border border-gray-200 p-6 ">
        <div className="mb-6">
          <h3 className="heading-lg font-normal text-[#3B3634] font-instrument-serif mb-2">
            Skontaktuj się z nami
          </h3>
          <div className="text-lg text-[#3B3634] font-instrument-sans space-y-3">
  <p>
    Ten formularz służy do kontaktu z naszym zespołem w sprawach takich jak:
  </p>

  <ul className="list-disc pl-6 space-y-1">
    <li>Zgłaszanie błędów i nieprawidłowego działania platformy</li>
    <li>Opisywanie problemów związanych z korzystaniem z konta lub funkcji</li>
    <li>Proponowanie nowych funkcjonalności</li>
    <li>Kontakt w sprawach technicznych</li>
    <li>Każdy inny ważny powód, który wymaga naszej uwagi</li>
  </ul>

  <p>
    Wypełnij formularz, a odpowiednia osoba z naszego zespołu odezwie się do Ciebie tak szybko, jak to możliwe.
  </p>
</div>
</div>
        <TicketForm
          customerEmail={customerEmail}
          customerName={customerName}
        />
      </div>
    </div>
  )
}
