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

const returnSteps = [
  {
    step: 1,
    title: "Zamówienie dostarczone",
    desc: 'Po dostarczeniu zamówienia przycisk "Zgłoś zwrot" aktywuje się w panelu użytkownika. Przejdź do "Moje zamówienia" i wybierz odpowiednie zamówienie.',
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
  },
  {
    step: 2,
    title: "Zgłoś zwrot",
    desc: "Wybierz produkty do zwrotu, podaj powód i dodaj opcjonalną notatkę. System automatycznie utworzy wniosek o zwrot dla sprzedawcy.",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    step: 3,
    title: "Sprzedawca rozpatruje wniosek",
    desc: "Sprzedawca ma możliwość zatwierdzenia, odrzucenia lub eskalacji zwrotu. Otrzymasz powiadomienie o decyzji sprzedawcy.",
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </>
    ),
  },
  {
    step: 4,
    title: "Wyślij produkt",
    desc: "Po zatwierdzeniu zwrotu, zapakuj produkt bezpiecznie i wyślij na adres podany przez sprzedawcę. Zachowaj potwierdzenie nadania przesyłki.",
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
  {
    step: 5,
    title: "Automatyczny zwrot pieniędzy",
    desc: "Gdy sprzedawca potwierdzi odbiór produktu, system automatycznie przetworzy zwrot pieniędzy przez Stripe. Środki wrócą na Twoje konto w ciągu 5-10 dni roboczych.",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    ),
  },
]

const returnConditions = [
  {
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </>
    ),
    title: "Stan nienaruszony",
    desc: "Produkt musi być w stanie nienaruszonym z zachowanym opakowaniem",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    title: "14 dni od dostawy",
    desc: "Zwrot można zgłosić w ciągu 14 dni od otrzymania przesyłki",
  },
  {
    icon: (
      <>
        <path d="M12 2v20M2 12h20" />
      </>
    ),
    title: "Wyjątki",
    desc: "Produkty personalizowane lub na zamówienie mogą nie podlegać zwrotowi",
  },
  {
    icon: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    title: "Koszt zwrotu",
    desc: "Koszt odesłania produktu ponosi klient, chyba że produkt jest wadliwy",
  },
]

const complaints = [
  {
    title: "Wady ukryte",
    desc: "Można reklamować do 2 lat od zakupu zgodnie z prawem konsumenckim",
    tags: ["Do 2 lat"],
    icon: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  {
    title: "Niezgodność z opisem",
    desc: "Zgłoś jak najszybciej po otrzymaniu produktu",
    tags: ["Po odbiorze"],
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
  },
  {
    title: "Uszkodzenia w transporcie",
    desc: "Zgłoś w ciągu 48 godzin od otrzymania",
    tags: ["48 godzin"],
    icon: (
      <>
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    ),
  },
]

const ReturnsContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="returns-content">
      {/* Header */}
      <header className="mb-6 md:mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Zwroty i reklamacje
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Twoja satysfakcja jest najważniejsza - poznaj proces zwrotów
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-6 md:mb-12" />

      <div className="max-w-none space-y-10">
        {/* Key Info */}
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
              Masz{" "}
              <strong className="text-[#3B3634] font-semibold">
                14 dni na zwrot bez podania przyczyny
              </strong>{" "}
              zgodnie z polskim prawem konsumenckim. Każdy sprzedawca na
              platformie obsługuje zwroty i reklamacje, a proces jest
              wspierany przez nasz system.
            </p>
          </div>
        </ArtCard>

        {/* Return Process */}
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
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Jak działa zwrot?
            </h2>
          </div>

          <div className="space-y-0">
            {returnSteps.map((item, index) => (
              <div
                key={item.step}
                className="relative flex items-start gap-2 md:gap-6"
              >
                {index < returnSteps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-[#3B3634]/10" />
                )}

                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-[#3B3634] text-white flex items-center justify-center font-instrument-sans font-semibold text-lg">
                    {item.step}
                  </div>
                </div>

                <div
                  className={`flex-1 group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300 ${
                    index < returnSteps.length - 1 ? "mb-6" : ""
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

        {/* Return Conditions */}
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
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Warunki zwrotu
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            {returnConditions.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634]/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 stroke-[#3B3634]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[#3B3634]/60 text-sm font-instrument-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>

        <BrushDivider />

        {/* Complaints */}
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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Reklamacje
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-2 md:gap-6">
            {complaints.map((item, i) => (
              <div
                key={i}
                className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634]/20 flex items-center justify-center group-hover:bg-[#3B3634] group-hover:border-[#3B3634] transition-colors duration-300">
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
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                      {item.title}
                    </h3>
                    <p className="text-[#3B3634]/60 font-instrument-sans text-sm mb-3">
                      {item.desc}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>

        {/* Footer CTA */}
        <div className="text-center pt-2 pb-4">
          <BrushDivider className="mb-8" />
          <p className="text-[#3B3634]/50 font-instrument-sans text-sm italic">
            Masz pytania dotyczące zwrotów? Napisz do nas na{" "}
          

      
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

export default ReturnsContent