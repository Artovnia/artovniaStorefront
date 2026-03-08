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
    <div className="w-full space-y-8">
      {/* Contact form card */}
      <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 px-2 py-4 md:px-8 md:py-8">
      

        <div className="mb-8">
          {/* Section icon */}
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-6 h-6 text-[#3B3634] opacity-40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            <h3 className="text-xl  text-[#3B3634] font-instrument-serif font-normal">
              Skontaktuj się z nami
            </h3>
          </div>

          {/* Brush stroke divider under heading */}
          <div className="mb-5">
            <svg
              className="w-36 h-3 text-[#3B3634]/15"
              viewBox="0 0 200 12"
              fill="none"
            >
              <path
                d="M3 6c30-4 60-3 90 0s60 4 100 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="text-base text-[#3B3634]/90 font-instrument-sans space-y-4 leading-relaxed">
            <p>
              Ten formularz służy do kontaktu z naszym zespołem w sprawach
              takich jak:
            </p>

            <ul className="space-y-2.5 ml-1">
              {[
                "Zgłaszanie błędów i nieprawidłowego działania platformy",
                "Opisywanie problemów związanych z korzystaniem z konta lub funkcji",
                "Proponowanie nowych funkcjonalności",
                "Kontakt w sprawach technicznych",
                "Każdy inny ważny powód, który wymaga naszej uwagi",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 flex-shrink-0 self-center rounded-full bg-[#3B3634]/30" />
                  <span>{item}</span>
                </li>
              ))}
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

      {/* Contact details card */}
      <div className="relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8">
       

        {/* Section icon */}
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-6 h-6 text-[#3B3634] opacity-40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl  text-[#3B3634] font-instrument-serif font-normal">
            Dane kontaktowe
          </h3>
        </div>

        {/* Brush stroke divider */}
        <div className="mb-6">
          <svg
            className="w-36 h-3 text-[#3B3634]/15"
            viewBox="0 0 200 12"
            fill="none"
          >
            <path
              d="M3 6c30-4 60-3 90 0s60 4 100 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-[#3B3634]/90 font-instrument-sans text-base leading-relaxed space-y-4">
          <p className="text-lg font-medium text-[#3B3634]">
            Ann Sayuri ART Anna Wawrzyniak
          </p>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 flex-shrink-0 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div>
                <p>ul. Leszczyńskiego 4/29</p>
                <p>50-078 Wrocław</p>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 flex-shrink-0 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>
                E-mail:{" "}
                <span
                  className="text-[#3B3634] underline underline-offset-4 cursor-pointer hover:text-[#3B3634]/90 transition-colors duration-200"
                  onClick={() =>
                    (window.location.href = atob(
                      "bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t"
                    ))
                  }
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.href = atob(
                        "bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t"
                      )
                    }
                  }}
                >
                  {"info.artovnia" + "@" + "gmail.com"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 flex-shrink-0 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>NIP: 9261642417</span>
            </div>

            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 flex-shrink-0 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>REGON: 522385177</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status-like decorative element */}
      <div className="flex items-center justify-center space-x-2 text-sm text-[#3B3634]/30 pt-4 pb-8">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span>Zespół wsparcia online</span>
      </div>
    </div>
  )
}