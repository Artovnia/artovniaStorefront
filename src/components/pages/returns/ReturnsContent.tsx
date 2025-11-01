"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const ReturnsContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="returns-content">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Zwroty i reklamacje
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-instrument-sans mb-4">
          Twoja satysfakcja jest najważniejsza - poznaj proces zwrotów
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
        {/* Key Information Badge */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-10 shadow-sm">
          <p className="text-lg leading-relaxed text-[#3B3634] font-instrument-sans">
            Masz <strong className="font-semibold">14 dni na zwrot bez podania przyczyny</strong> zgodnie z polskim prawem konsumenckim. 
            Każdy sprzedawca na platformie obsługuje zwroty i reklamacje, a proces jest wspierany przez nasz system.
          </p>
        </div>

        <div className="space-y-10">
          {/* Return Process for Registered Users */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Jak działa zwrot? (Użytkownicy z kontem)
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Zamówienie dostarczone</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Po dostarczeniu zamówienia przycisk &quot;Zgłoś zwrot&quot; aktywuje się w panelu użytkownika. 
                    Przejdź do &quot;Moje zamówienia&quot; i wybierz odpowiednie zamówienie.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Zgłoś zwrot</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Wybierz produkty do zwrotu, podaj powód i dodaj opcjonalną notatkę. 
                    System automatycznie utworzy wniosek o zwrot dla sprzedawcy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Sprzedawca rozpatruje wniosek</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Sprzedawca ma możliwość zatwierdzenia, odrzucenia lub eskalacji zwrotu. 
                    Otrzymasz powiadomienie o decyzji sprzedawcy.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Wyślij produkt</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Po zatwierdzeniu zwrotu, zapakuj produkt bezpiecznie i wyślij na adres podany przez sprzedawcę. 
                    Zachowaj potwierdzenie nadania przesyłki.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Automatyczny zwrot pieniędzy</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Gdy sprzedawca potwierdzi odbiór produktu, system automatycznie przetworzy zwrot pieniędzy przez Stripe. 
                    Środki wrócą na Twoje konto w ciągu 5-10 dni roboczych.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div className="bg-[#F4F0EB] border border-[#3B3634]/20 rounded-lg p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 border-2 border-[#3B3634] rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
                Warunki zwrotu
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Stan nienaruszony</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Produkt musi być w stanie nienaruszonym z zachowanym opakowaniem</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">14 dni od dostawy</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Zwrot można zgłosić w ciągu 14 dni od otrzymania przesyłki</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Wyjątki</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Produkty personalizowane lub na zamówienie mogą nie podlegać zwrotowi</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Koszt zwrotu</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Koszt odesłania produktu ponosi klient, chyba że produkt jest wadliwy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints Section */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Reklamacje
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Wady ukryte</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm">
                      Można reklamować do 2 lat od zakupu zgodnie z prawem konsumenckim
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Niezgodność z opisem</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm">
                      Zgłoś jak najszybciej po otrzymaniu produktu
                    </p>
                  </div>
                </div>
              </div>

              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Uszkodzenia w transporcie</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm">
                      Zgłoś w ciągu 48 godzin od otrzymania
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ReturnsContent
