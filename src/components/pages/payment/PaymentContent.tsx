"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import Image from "next/image"

const PaymentContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="payment-content">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Formy płatności
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-instrument-sans mb-4">
          Bezpieczne i wygodne metody płatności dla Twojego komfortu
        </p>
        <div className="text-sm text-gray-500">
          <p className="font-instrument-sans">
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-none">
        {/* Stripe Provider Badge */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-lg leading-relaxed text-[#3B3634] font-instrument-sans">
                Wszystkie płatności są przetwarzane przez <strong className="font-semibold">Stripe</strong> - 
                globalnego lidera w zakresie bezpiecznych płatności online. Płatność odbywa się jednorazowo 
                za całe zamówienie, niezależnie od liczby sprzedawców.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-6 py-4 bg-[#635BFF]/5 rounded-lg border border-[#635BFF]/20">
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
        </div>

        <div className="space-y-10">
          {/* Available Payment Methods */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Dostępne metody płatności
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Credit Cards */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Karty płatnicze</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Visa, Mastercard, American Express - płatność natychmiastowa z zabezpieczeniem 3D Secure.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Visa</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Mastercard</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Amex</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLIK */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
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
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">BLIK</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Szybka płatność mobilna - wystarczy 6-cyfrowy kod z aplikacji bankowej.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Natychmiastowa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Przelewy24 */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
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
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Przelewy24</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Bezpośrednie przelewy z kont w największych polskich bankach.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">PKO BP</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">mBank</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">ING</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Payments */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Płatności mobilne</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Apple Pay, Google Pay - wygodne płatności jednym dotknięciem.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Apple Pay</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Google Pay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-[#F4F0EB] border border-[#3B3634]/20 rounded-lg p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 border-2 border-[#3B3634] rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
                Bezpieczeństwo płatności
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Szyfrowanie SSL/TLS</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Wszystkie dane są szyfrowane najwyższym standardem bezpieczeństwa</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">3D Secure</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Dodatkowa warstwa zabezpieczeń dla transakcji kartami</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Brak przechowywania danych</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Dane kart nie są zapisywane na naszych serwerach</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Certyfikowany operator</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Stripe - licencjonowany operator płatności PCI DSS Level 1</p>
                </div>
              </div>
            </div>
          </div>

          {/* How Payment Works */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Jak działają płatności?
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Jedna płatność</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Płacisz jednorazowo za całe zamówienie, nawet jeśli kupujesz od kilku różnych sprzedawców. 
                    Wygodnie i bez komplikacji.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Automatyczny podział</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    System Stripe Connect automatycznie dzieli środki między sprzedawców zgodnie z wartością 
                    ich produktów. Wszystko odbywa się w tle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Zabezpieczenie transakcji</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Środki są zabezpieczone do momentu potwierdzenia odbioru produktów przez kupującego. 
                    Twoje zakupy są chronione.
                  </p>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default PaymentContent
