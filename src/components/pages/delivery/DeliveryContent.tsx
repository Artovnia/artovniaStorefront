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
    className={`relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 md:p-10 ${className}`}
  >
   
    {children}
  </div>
)

const deliveryMethods = [
  {
    title: "Paczkomaty InPost",
    desc: "Wygodny odbiór 24/7 z automatów paczkowych w całej Polsce. Otrzymasz SMS z kodem odbioru.",
    tags: ["24/7", "Cała Polska"],
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
  },
  {
    title: "Kurier",
    desc: "Dostawa bezpośrednio pod wskazany adres. Idealna dla większych przedmiotów artystycznych.",
    tags: ["DPD", "DHL", "UPS"],
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
    title: "Poczta Polska",
    desc: "Tradycyjna przesyłka pocztowa z odbiorem w placówce lub dostawą do skrzynki.",
    tags: ["Ekonomiczna"],
    icon: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
  {
    title: "Odbiór osobisty",
    desc: "Niektórzy sprzedawcy oferują możliwość osobistego odbioru dzieła bezpośrednio od twórcy.",
    tags: ["Bez kosztów"],
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
]

const trackingInfo = [
  {
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </>
    ),
    title: "Czas pakowania",
    desc: "Każdy sprzedawca określa własny czas przygotowania zamówienia - od 1 do kilku dni roboczych",
  },
  {
    icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    title: "Produkty na zamówienie",
    desc: "Dzieła wykonywane specjalnie dla Ciebie mogą wymagać dłuższego czasu realizacji - szczegóły w opisie produktu",
  },
  {
    icon: (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    title: "Śledzenie przesyłki",
    desc: "Jako zalogowany użytkownik możesz śledzić status zamówienia: spakowane, wysłane, dostarczone",
  },
  {
    icon: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    title: "Dostawa w Polsce",
    desc: "Obecnie wszystkie dostawy realizowane są wyłącznie na terenie Polski",
  },
]

const deliverySteps = [
  {
    step: 1,
    title: "Wybór w koszyku",
    desc: "Po dodaniu produktów do koszyka zobaczysz dostępne opcje dostawy dla każdego sprzedawcy osobno. Każdy twórca może oferować różne metody wysyłki.",
    icon: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </>
    ),
  },
  {
    step: 2,
    title: "Osobne przesyłki",
    desc: "Jeśli kupujesz od kilku sprzedawców, każdy z nich wysyła swoje produkty osobno. Dzięki temu dzieła są pakowane z najwyższą starannością przez ich twórców.",
    icon: (
      <>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
  },
  {
    step: 3,
    title: "Śledzenie statusu",
    desc: "W panelu użytkownika możesz śledzić status każdego zamówienia - od momentu spakowania, przez wysyłkę, aż do dostarczenia. Otrzymasz również powiadomienia o zmianach statusu.",
    icon: (
      <>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </>
    ),
  },
]

const DeliveryContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="delivery-content">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Formy dostawy
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Elastyczne opcje wysyłki dostosowane do potrzeb każdego twórcy
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-12" />

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
              Każdy sprzedawca na platformie{" "}
              <strong className="text-[#3B3634] font-semibold">
                samodzielnie ustala metody dostawy
              </strong>{" "}
              i koszty wysyłki dla swoich produktów. Dzięki temu twórcy mogą
              dostosować opcje wysyłki do specyfiki swoich dzieł - od małych
              biżuterii po duże obrazy czy rzeźby.
            </p>
          </div>
        </ArtCard>

        {/* Available Delivery Methods */}
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
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Popularne metody dostawy
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {deliveryMethods.map((method, i) => (
              <div
                key={i}
                className="group p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300"
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
                      {method.icon}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                      {method.title}
                    </h3>
                    <p className="text-[#3B3634]/60 font-instrument-sans text-sm mb-3">
                      {method.desc}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {method.tags.map((tag) => (
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

        <BrushDivider />

        {/* Shipping Times & Tracking */}
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Czas realizacji i śledzenie
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {trackingInfo.map((item, i) => (
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

        {/* How Delivery Works */}
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Jak działa dostawa?
            </h2>
          </div>

          <div className="space-y-0">
            {deliverySteps.map((item, index) => (
              <div key={item.step} className="relative flex items-start gap-6">
                {/* Vertical connector line */}
                {index < deliverySteps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-[#3B3634]/10" />
                )}

                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-[#3B3634] text-white flex items-center justify-center font-instrument-sans font-semibold text-lg">
                    {item.step}
                  </div>
                </div>

                <div
                  className={`flex-1 group p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/25 transition-all duration-300 ${
                    index < deliverySteps.length - 1 ? "mb-6" : ""
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

        {/* Footer CTA */}
        <div className="text-center pt-2 pb-4">
          <BrushDivider className="mb-8" />
<p className="text-[#3B3634]/50 font-instrument-sans text-sm italic">
          Masz pytania dotyczące dostawy? Napisz do nas na{" "}
          

      
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

export default DeliveryContent