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
    <div className="w-full space-y-6">
      <div className="bg-primary border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="heading-lg font-normal text-[#3B3634] font-instrument-serif mb-2">
            Skontaktuj się z nami
          </h3>
          <div className="text-lg text-[#3B3634] font-instrument-sans space-y-3">
            <p>
              Ten formularz służy do kontaktu z naszym zespołem w sprawach
              takich jak:
            </p>

            <ul className="list-disc pl-6 space-y-1">
              <li>
                Zgłaszanie błędów i nieprawidłowego działania platformy
              </li>
              <li>
                Opisywanie problemów związanych z korzystaniem z konta lub
                funkcji
              </li>
              <li>Proponowanie nowych funkcjonalności</li>
              <li>Kontakt w sprawach technicznych</li>
              <li>
                Każdy inny ważny powód, który wymaga naszej uwagi
              </li>
            </ul>

            <p>
              Wypełnij formularz, a odpowiednia osoba z naszego zespołu
              odezwie się do Ciebie tak szybko, jak to możliwe.
            </p>
          </div>
        </div>
        <TicketForm
          customerEmail={customerEmail}
          customerName={customerName}
        />
      </div>

      <div className="bg-primary border border-gray-200 p-6">
        <h3 className="heading-lg font-normal text-[#3B3634] font-instrument-serif mb-4">
          Dane kontaktowe
        </h3>
        <div className="text-[#3B3634] font-instrument-sans text-base leading-relaxed space-y-1">
          <p className="font-medium text-lg mb-3">
            Ann Sayuri ART Anna Wawrzyniak
          </p>
          <p>ul. Leszczyńskiego 4/29</p>
          <p>50-078 Wrocław</p>
          <div className="mt-4 space-y-1">
            <p>
  E-mail:{" "}
  <span
    className="underline underline-offset-2 cursor-pointer hover:opacity-70 transition-opacity"
    onClick={() =>
      window.location.href =
        atob("bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t")
    }
    role="link"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        window.location.href =
          atob("bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t")
      }
    }}
  >
    {"info.artovnia" + "@" + "gmail.com"}
  </span>
</p>
            <p>NIP: 9261642417</p>
            <p>REGON: 522385177</p>
          </div>
        </div>
      </div>
    </div>
  )
}