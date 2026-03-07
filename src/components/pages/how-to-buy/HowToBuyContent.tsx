"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const BrushDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex justify-center ${className}`}>
    <svg
      className="w-64 h-4 text-[#3B3634]/20"
      viewBox="0 0 300 15"
      fill="none"
    >
      <path
        d="M5 8c40-5 80-3 120 0s80 5 120 1c15-2 30-3 45-1"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
)

const ArtCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 px-2 py-4 md:px-8 md:py-8 ${className}`}
  >
    
    {children}
  </div>
)

const steps = [
  {
    step: 1,
    title: "Przeglądaj i wybieraj",
    desc: "Przeglądaj produkty od różnych twórców i dodawaj je do koszyka. Możesz kupować od kilku sprzedawców jednocześnie.",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
  },
  {
    step: 2,
    title: "Wybierz dostawę",
    desc: "Dla każdego sprzedawcy możesz osobno wybrać preferowaną metodę dostawy. Dostępne opcje zobaczysz w koszyku.",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <path d="M16 8h4l3 3v5a1 1 0 0 1-1 1h-1" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    step: 3,
    title: "Zapłać jednorazowo",
    desc: "Płatność odbywa się jednorazowo za całe zamówienie, niezależnie od liczby sprzedawców. System automatycznie podzieli środki między twórców.",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
  },
  {
    step: 4,
    title: "Otrzymaj produkty",
    desc: "Każdy sprzedawca wyśle swoje produkty osobno, zgodnie z wybraną przez Ciebie metodą dostawy.",
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
]

const benefits = [
  {
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
    title: "Historia zamówień",
    desc: "Dostęp do historii zamówień i ich statusów w czasie rzeczywistym",
  },
  {
    icon: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
    title: "Lista ulubionych",
    desc: "Zapisuj produkty, które Ci się podobają i wracaj do nich w dowolnym momencie",
  },
  {
    icon: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
    title: "System wiadomości",
    desc: "Łatwiejszy kontakt ze sprzedawcami przez wbudowany system komunikacji",
  },
  {
    icon: (
      <>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </>
    ),
    title: "Rabaty i promocje",
    desc: "Dostęp do specjalnych rabatów, kodów promocyjnych i ofert dla stałych klientów",
  },
]

const productInfoItems = [
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    title: "Czas realizacji",
    desc: "Ile dni potrzebuje twórca na przygotowanie produktu",
  },
  {
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
    title: "Dostępność",
    desc: "Czy produkt jest gotowy do wysyłki, czy tworzony na zamówienie",
  },
  {
    icon: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </>
    ),
    title: "Opcje personalizacji",
    desc: "Czy możesz dostosować produkt do swoich potrzeb",
  },
]

const HowToBuyContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="how-to-buy-content">
      {/* Header */}
      <header className="mb-6 md:mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Jak kupować?
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Prosty przewodnik po zakupach na Artovni – od przeglądania po
          otrzymanie paczki
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-6 md:mb-12" />

      <div className="max-w-none space-y-10">
        {/* Intro Card */}
        <ArtCard>
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 hidden sm:flex w-14 h-14 border-2 border-[#3B3634]/30 items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-[#3B3634]/80 font-instrument-sans">
              Zakupów na Artovni możesz dokonać zarówno jako{" "}
              <strong className="text-[#3B3634] font-semibold">gość</strong>,
              jak i po{" "}
              <strong className="text-[#3B3634] font-semibold">
                założeniu konta
              </strong>
              . Rejestracja daje jednak dodatkowe korzyści – dostęp do historii
              zamówień, możliwość zapisywania ulubionych produktów, łatwiejszy
              kontakt ze sprzedawcami oraz dostęp do specjalnych rabatów.
            </p>
          </div>
        </ArtCard>

        {/* Shopping Process */}
        <ArtCard>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 border-2 border-[#3B3634]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Proces zakupowy
            </h2>
          </div>

          <div className="space-y-0">
            {steps.map((item, index) => (
              <div key={item.step} className="relative flex items-start gap-2 md:gap-6">
                {/* Vertical connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-[#3B3634]/10" />
                )}

                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-[#3B3634] text-white flex items-center justify-center font-instrument-sans font-semibold text-lg">
                    {item.step}
                  </div>
                </div>

                <div
                  className={`flex-1 group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300 ${
                    index < steps.length - 1 ? "mb-6" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634]/15 flex items-center justify-center group-hover:border-[#3B3634]/30 transition-colors duration-300">
                      <svg
                        className="w-5 h-5 stroke-[#3B3634]/50 group-hover:stroke-[#3B3634] transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {item.icon}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-instrument-sans font-semibold text-xl mb-2 text-[#3B3634]">
                        {item.title}
                      </h3>
                      <p className="text-[#3B3634]/60 font-instrument-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>

        <BrushDivider />

        {/* Benefits of Registration */}
        <ArtCard>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 border-2 border-[#3B3634]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Korzyści z rejestracji
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            {benefits.map((item, i) => (
              <div
                key={i}
                className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 border-2 border-[#3B3634]/20 flex items-center justify-center group-hover:bg-[#3B3634] group-hover:border-[#3B3634] transition-colors duration-300">
                    <svg
                      className="w-5 h-5 stroke-[#3B3634] group-hover:stroke-white transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-1.5 text-[#3B3634]">
                      {item.title}
                    </h3>
                    <p className="text-[#3B3634]/60 text-sm font-instrument-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>

        <BrushDivider />

        {/* Product Information */}
        <ArtCard>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 border-2 border-[#3B3634]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Informacje o produktach
            </h2>
          </div>

          <p className="text-[#3B3634]/70 font-instrument-sans leading-relaxed mb-8 text-lg">
            Informacje o czasie realizacji i dostępności (od ręki lub na
            zamówienie) znajdziesz w opisie każdego produktu. Zwróć uwagę na:
          </p>

          <div className="grid sm:grid-cols-3 gap-2 md:gap-6">
            {productInfoItems.map((item, i) => (
              <div
                key={i}
                className="group text-center p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300"
              >
                <div className="w-12 h-12 border-2 border-[#3B3634]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3B3634] group-hover:border-[#3B3634] transition-colors duration-300">
                  <svg
                    className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-2">
                  {item.title}
                </h3>
                <p className="text-[#3B3634]/55 text-sm font-instrument-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </ArtCard>

        {/* Final CTA hint */}
        <div className="text-center pt-2 pb-4">
          <BrushDivider className="mb-8" />
          <p className="text-[#3B3634]/50 font-instrument-sans text-sm italic">
            Masz pytania? Napisz do nas na{" "}
          

      
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
          
        </div>
      </div>
    </div>
  )
}

export default HowToBuyContent