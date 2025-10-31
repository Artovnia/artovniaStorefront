"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const DeliveryContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="delivery-content">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Formy dostawy
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-instrument-sans mb-4">
          Elastyczne opcje wysyłki dostosowane do potrzeb każdego twórcy
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
            Każdy sprzedawca na platformie <strong className="font-semibold">samodzielnie ustala metody dostawy</strong> 
            {" "}i koszty wysyłki dla swoich produktów. Dzięki temu twórcy mogą dostosować opcje wysyłki do specyfiki 
            swoich dzieł - od małych biżuterii po duże obrazy czy rzeźby.
          </p>
        </div>

        <div className="space-y-10">
          {/* Available Delivery Methods */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Popularne metody dostawy
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* InPost Paczkomaty */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Paczkomaty InPost</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Wygodny odbiór 24/7 z automatów paczkowych w całej Polsce. Otrzymasz SMS z kodem odbioru.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">24/7</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Cała Polska</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kurier */}
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
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Kurier</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Dostawa bezpośrednio pod wskazany adres. Idealna dla większych przedmiotów artystycznych.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">DPD</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">DHL</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">UPS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poczta Polska */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Poczta Polska</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Tradycyjna przesyłka pocztowa z odbiorem w placówce lub dostawą do skrzynki.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Ekonomiczna</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Odbiór osobisty */}
              <div className="group p-6 border border-gray-200 rounded-lg hover:border-[#3B3634] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 border-2 border-[#3B3634] rounded-lg flex items-center justify-center group-hover:bg-[#3B3634] transition-colors">
                    <svg className="w-6 h-6 stroke-[#3B3634] group-hover:stroke-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-instrument-sans font-semibold text-lg mb-2 text-[#3B3634]">Odbiór osobisty</h3>
                    <p className="text-gray-600 font-instrument-sans text-sm mb-3">
                      Niektórzy sprzedawcy oferują możliwość osobistego odbioru dzieła bezpośrednio od twórcy.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-instrument-sans">Bez kosztów</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Times & Tracking */}
          <div className="bg-[#F4F0EB] border border-[#3B3634]/20 rounded-lg p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 border-2 border-[#3B3634] rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
                Czas realizacji i śledzenie
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Czas pakowania</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Każdy sprzedawca określa własny czas przygotowania zamówienia - od 1 do kilku dni roboczych</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Produkty na zamówienie</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Dzieła wykonywane specjalnie dla Ciebie mogą wymagać dłuższego czasu realizacji - szczegóły w opisie produktu</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Śledzenie przesyłki</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Jako zalogowany użytkownik możesz śledzić status zamówienia: spakowane, wysłane, dostarczone</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#3B3634] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 stroke-[#3B3634]" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-instrument-sans font-semibold text-[#3B3634] mb-1">Dostawa w Polsce</h3>
                  <p className="text-gray-700 text-sm font-instrument-sans">Obecnie wszystkie dostawy realizowane są wyłącznie na terenie Polski</p>
                </div>
              </div>
            </div>
          </div>

          {/* How Delivery Works */}
          <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-200">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic mb-8 text-[#3B3634]">
              Jak działa dostawa?
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Wybór w koszyku</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Po dodaniu produktów do koszyka zobaczysz dostępne opcje dostawy dla każdego sprzedawcy osobno. 
                    Każdy twórca może oferować różne metody wysyłki.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Osobne przesyłki</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    Jeśli kupujesz od kilku sprzedawców, każdy z nich wysyła swoje produkty osobno. 
                    Dzięki temu dzieła są pakowane z najwyższą starannością przez ich twórców.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-instrument-sans font-semibold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-instrument-sans font-semibold text-xl mb-3 text-[#3B3634]">Śledzenie statusu</h3>
                  <p className="text-gray-600 font-instrument-sans leading-relaxed">
                    W panelu użytkownika możesz śledzić status każdego zamówienia - od momentu spakowania, 
                    przez wysyłkę, aż do dostarczenia. Otrzymasz również powiadomienia o zmianach statusu.
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

export default DeliveryContent
