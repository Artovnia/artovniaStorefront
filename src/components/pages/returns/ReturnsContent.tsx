"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const ReturnsContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="returns-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Zwroty i reklamacje
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        <div className="bg-primary/5 border border-primary/20 rounded-md p-8 mb-10">
          <p className="text-lg leading-relaxed text-gray-700 mb-0">
            Twoja satysfakcja jest dla nas najważniejsza. Jeśli produkt nie spełnia Twoich oczekiwań 
            lub ma wady, masz prawo do zwrotu lub reklamacji zgodnie z polskim prawem konsumenckim.
          </p>
        </div>

        <div className="space-y-8">
          {/* Return Policy */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Prawo do zwrotu
            </h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-6">
                <h3 className="font-medium text-lg mb-3 text-green-800">
                  14 dni na zwrot bez podania przyczyny
                </h3>
                <p className="text-green-700">
                Zgodnie z obowiązującym prawem, każdy sprzedawca ma obowiązek umożliwić klientowi zwrot towaru w terminie 14 dni od otrzymania przesyłki, z wyjątkiem produktów wykonywanych na zamówienie lub personalizowanych.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                <h4 className="font-medium text-lg mb-3 text-blue-800">Obowiązki sprzedawcy:</h4>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <span>udostępnić adres do zwrotów (może się różnić od adresu kontaktowego),</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <span>obsługiwać zwroty i reklamacje zgodnie z ustawą o prawach konsumenta,</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <span>udostępnić klientowi formularz zwrotu (lub przyjąć go przez panel klienta).</span>
                  </li>
                </ul>
                <p className="text-blue-700 mt-4 font-medium">
                  Reklamacje są rozpatrywane bezpośrednio między klientem a sprzedawcą.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-lg">Warunki zwrotu:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Produkt musi być w stanie nienaruszonym</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Zachowane oryginalne opakowanie (jeśli było)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Brak śladów używania (dla produktów higienicznych)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <span>Zgłoszenie zwrotu w ciągu 14 dni od otrzymania</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How to Return */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Jak zgłosić zwrot?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Skontaktuj się ze sprzedawcą</h3>
                  <p className="text-gray-600">
                    Napisz wiadomość do sprzedawcy przez system wiadomości na platformie 
                    lub skontaktuj się bezpośrednio podając numer zamówienia.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Otrzymaj instrukcje</h3>
                  <p className="text-gray-600">
                    Sprzedawca przekaże Ci szczegółowe instrukcje dotyczące zwrotu, 
                    w tym adres do odesłania produktu.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Wyślij produkt</h3>
                  <p className="text-gray-600">
                    Zapakuj produkt bezpiecznie i wyślij na wskazany adres. 
                    Zachowaj potwierdzenie nadania przesyłki.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Otrzymaj zwrot pieniędzy</h3>
                  <p className="text-gray-600">
                    Po otrzymaniu i sprawdzeniu produktu przez sprzedawcę, 
                    środki zostaną zwrócone na Twoje konto w ciągu 14 dni.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-amber-800">
              Reklamacje
            </h2>
            
            <div className="space-y-4 text-amber-700">
              <p className="font-medium">
                Jeśli produkt ma wadę lub nie jest zgodny z opisem, możesz złożyć reklamację:
              </p>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-3 mt-1">•</span>
                  <span><strong>Wady ukryte</strong> - można reklamować do 2 lat od zakupu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-3 mt-1">•</span>
                  <span><strong>Niezgodność z opisem</strong> - zgłoś jak najszybciej po otrzymaniu</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-3 mt-1">•</span>
                  <span><strong>Uszkodzenia w transporcie</strong> - zgłoś w ciągu 48 godzin</span>
                </li>
              </ul>
            </div>
          </div>

         
          {/* Contact Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Potrzebujesz pomocy?
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Kontakt z obsługą klienta:</strong>
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="text-primary mr-3">📧</span>
                  <span>sayuri.platform@gmail.com</span>
                </li>
                <li className="flex items-center">
                  <span className="text-primary mr-3">💬</span>
                  <span>System wiadomości na platformie</span>
                </li>
              </ul>
              
              <p className="text-sm text-gray-600 mt-6">
                Odpowiadamy na wszystkie zapytania w ciągu 24 godzin w dni robocze.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnsContent
