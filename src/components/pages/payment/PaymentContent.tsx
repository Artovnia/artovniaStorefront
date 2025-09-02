"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const PaymentContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="payment-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Formy płatności
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
            Na platformie Artovnia oferujemy bezpieczne i wygodne metody płatności. 
            Wszystkie transakcje są zabezpieczone, a płatność odbywa się jednorazowo za całe zamówienie, 
            niezależnie od liczby sprzedawców.
          </p>
        </div>

        <div className="space-y-8">
          {/* Available Payment Methods */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Dostępne metody płatności
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">💳</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Karty płatnicze</h3>
                  <p className="text-gray-600 mb-2">
                    Visa, Mastercard, American Express - płatność natychmiastowa z pełnym zabezpieczeniem 3D Secure.
                  </p>
                  <div className="text-sm text-gray-500">
                    Obsługujemy karty debetowe i kredytowe
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">🏦</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">BLIK</h3>
                  <p className="text-gray-600 mb-2">
                    Szybka płatność mobilna - wystarczy kod z aplikacji bankowej.
                  </p>
                  <div className="text-sm text-gray-500">
                    Dostępne dla użytkowników polskich banków
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">🌐</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Przelewy online</h3>
                  <p className="text-gray-600 mb-2">
                    Bezpośrednie przelewy z kont w największych polskich bankach.
                  </p>
                  <div className="text-sm text-gray-500">
                    PKO BP, mBank, ING, Santander, Millennium i inne
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">📱</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Płatności mobilne</h3>
                  <p className="text-gray-600 mb-2">
                    Apple Pay, Google Pay - wygodne płatności jednym dotknięciem.
                  </p>
                  <div className="text-sm text-gray-500">
                    Dostępne na urządzeniach mobilnych
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-green-50 border border-green-200 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-green-800">
              Bezpieczeństwo płatności
            </h2>
            
            <div className="space-y-4 text-green-700">
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">🔒</span>
                <span>Wszystkie płatności są szyfrowane protokołem SSL</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">🛡️</span>
                <span>Obsługujemy standard 3D Secure dla kart płatniczych</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">✅</span>
                <span>Nie przechowujemy danych kart płatniczych na naszych serwerach</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">🏪</span>
                <span>Współpracujemy z licencjonowanymi operatorami płatności</span>
              </div>
            </div>
          </div>

          {/* How Payment Works */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Jak działają płatności?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Jedna płatność</h3>
                  <p className="text-gray-600">
                    Płacisz jednorazowo za całe zamówienie, nawet jeśli kupujesz od kilku różnych sprzedawców.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Automatyczny podział</h3>
                  <p className="text-gray-600">
                    System automatycznie dzieli środki między sprzedawców zgodnie z wartością ich produktów.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#3B3634] text-white rounded-full flex items-center justify-center font-medium text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Zabezpieczenie transakcji</h3>
                  <p className="text-gray-600">
                    Środki są zabezpieczone do momentu potwierdzenia odbioru produktów przez kupującego.
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
