"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import Image from "next/image"

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

const PaymentContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="payment-content">
      {/* Header */}
      <header className="mb-6 md:mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Formy płatności
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/90 font-instrument-sans mb-4 max-w-lg mx-auto leading-relaxed">
          Bezpieczne i wygodne metody płatności dla Twojego komfortu
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-6 md:mb-12" />

      <div className="max-w-none space-y-10">
        {/* Stripe Provider Badge */}
        <ArtCard>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
            <div className="flex-1">
              <p className="text-lg leading-relaxed text-[#3B3634]/90 font-instrument-sans">
                Wszystkie płatności są przetwarzane przez{" "}
                <strong className="font-semibold text-[#3B3634]">
                  Stripe
                </strong>{" "}
                - globalnego lidera w zakresie bezpiecznych płatności online.
                Płatność odbywa się jednorazowo za całe zamówienie, niezależnie od ilu sprzedawców jednocześnie dokonujesz zakupu.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-6 py-4 bg-[#635BFF]/5 border border-[#635BFF]/15">
                <Image
                  src="/Stripe_Logo,_revised_2016.svg"
                  alt="Stripe - bezpieczne płatności online"
                  width={80}
                  height={34}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </div>
        </ArtCard>

        {/* Available Payment Methods */}
        <ArtCard>
          <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
            Dostępne metody płatności
          </h2>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Credit Cards */}
            <div className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634]/30 flex items-center justify-center group-hover:bg-[#3B3634] group-hover:border-[#3B3634] transition-colors duration-300">
                  <svg
                    className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                    Karty płatnicze
                  </h3>
                  <p className="text-[#3B3634]/90 font-instrument-sans text-sm mb-3">
                    Visa, Mastercard, American Express - płatność natychmiastowa
                    z zabezpieczeniem 3D Secure.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Visa
                    </span>
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Mastercard
                    </span>
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Amex
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BLIK */}
            <div className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-12 flex items-center justify-center">
                  <Image
                    src="/BLIK LOGO RGB.png"
                    alt="BLIK - szybkie płatności mobilne"
                    width={64}
                    height={48}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                    BLIK
                  </h3>
                  <p className="text-[#3B3634]/90 font-instrument-sans text-sm mb-3">
                    Szybka płatność mobilna - wystarczy 6-cyfrowy kod z
                    aplikacji bankowej.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Natychmiastowa
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Przelewy24 */}
            <div className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-12 flex items-center justify-center">
                  <Image
                    src="/Przelewy24_logo.svg"
                    alt="Przelewy24 - bezpieczne płatności online"
                    width={80}
                    height={48}
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                    Przelewy24
                  </h3>
                  <p className="text-[#3B3634]/90 font-instrument-sans text-sm mb-3">
                    Bezpośrednie przelewy z kont w największych polskich bankach.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      PKO BP
                    </span>
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      mBank
                    </span>
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      ING
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Payments */}
            <div className="group p-2 md:p-6 border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634]/30 flex items-center justify-center group-hover:bg-[#3B3634] group-hover:border-[#3B3634] transition-colors duration-300">
                  <svg
                    className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">
                    Płatności mobilne
                  </h3>
                  <p className="text-[#3B3634]/90 font-instrument-sans text-sm mb-3">
                    Apple Pay, Google Pay - wygodne płatności jednym dotknięciem.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Apple Pay
                    </span>
                    <span className="px-2 py-1 bg-[#3B3634]/5 text-[#3B3634]/70 text-xs font-instrument-sans">
                      Google Pay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ArtCard>

        <BrushDivider />

        {/* Security Information */}
        <ArtCard>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 border-2 border-[#3B3634]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Bezpieczeństwo płatności
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-2 md:gap-6">
            {[
              {
                icon: (
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                ),
                title: "Szyfrowanie SSL/TLS",
                desc: "Wszystkie dane są szyfrowane najwyższym standardem bezpieczeństwa",
              },
              {
                icon: (
                  <>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </>
                ),
                title: "3D Secure",
                desc: "Dodatkowa warstwa zabezpieczeń dla transakcji kartami",
              },
              {
                icon: (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </>
                ),
                title: "Brak przechowywania danych",
                desc: "Dane kart nie są zapisywane na naszych serwerach",
              },
              {
                icon: (
                  <>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </>
                ),
                title: "Certyfikowany operator",
                desc: "Stripe - licencjonowany operator płatności PCI DSS Level 1",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634]/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 stroke-[#3B3634]"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
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
                  <p className="text-[#3B3634]/90 text-sm font-instrument-sans">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>

        <BrushDivider />

        {/* How Payment Works */}
        <ArtCard>
          <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
            Jak działają płatności?
          </h2>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Jedna płatność",
                desc: "Płacisz jednorazowo za całe zamówienie, nawet jeśli kupujesz od kilku różnych sprzedawców. Wygodnie i bez komplikacji.",
              },
              {
                step: 2,
                title: "Automatyczny podział",
                desc: "System Stripe Connect automatycznie dzieli środki między sprzedawców zgodnie z wartością ich produktów. Wszystko odbywa się w tle.",
              },
              {
                step: 3,
                title: "Zabezpieczenie transakcji",
                desc: "Środki są zabezpieczone do momentu potwierdzenia odbioru produktów przez kupującego. Twoje zakupy są chronione.",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2 md:gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">
                    {item.title}
                  </h3>
                  <p className="text-[#3B3634]/90 font-instrument-sans leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ArtCard>
      </div>
    </div>
  )
}

export default PaymentContent