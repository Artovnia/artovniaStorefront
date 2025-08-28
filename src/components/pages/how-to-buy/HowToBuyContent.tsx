"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const HowToBuyContent = () => {
  const [lastUpdated] = useState(new Date(2024, 11, 13)) // December 13, 2024

  return (
    <div className="how-to-buy-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Jak kupować?
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
            Zakupów na Artovni możesz dokonać zarówno jako gość, jak i po założeniu konta. 
            Rejestracja daje jednak dodatkowe korzyści – dostęp do historii zamówień, możliwość 
            zapisywania ulubionych produktów, łatwiejszy kontakt ze sprzedawcami oraz dostęp do specjalnych rabatów.
          </p>
        </div>

        <div className="space-y-8">
          {/* Shopping Process */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Proces zakupowy
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Przeglądaj i wybieraj</h3>
                  <p className="text-gray-600">
                    Przeglądaj produkty od różnych twórców i dodawaj je do koszyka. 
                    Możesz kupować od kilku sprzedawców jednocześnie.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Wybierz dostawę</h3>
                  <p className="text-gray-600">
                    Dla każdego sprzedawcy możesz osobno wybrać preferowaną metodę dostawy. 
                    Dostępne opcje zobaczysz w koszyku.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Zapłać jednorazowo</h3>
                  <p className="text-gray-600">
                    Płatność odbywa się jednorazowo za całe zamówienie, niezależnie od liczby sprzedawców. 
                    System automatycznie podzieli środki między twórców.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Otrzymaj produkty</h3>
                  <p className="text-gray-600">
                    Każdy sprzedawca wyśle swoje produkty osobno, zgodnie z wybraną przez Ciebie metodą dostawy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits of Registration */}
          <div className="bg-primary/5 border border-primary/20 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Korzyści z rejestracji
            </h2>
            
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Dostęp do historii zamówień i ich statusów</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Możliwość zapisywania produktów do ulubionych</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Łatwiejszy kontakt ze sprzedawcami przez system wiadomości</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Dostęp do specjalnych rabatów i promocji</span>
              </li>
            </ul>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Informacje o produktach
            </h2>
            
            <p className="text-gray-700 mb-4">
              Informacje o czasie realizacji i dostępności (od ręki lub na zamówienie) znajdziesz w opisie każdego produktu. 
              Zwróć uwagę na:
            </p>
            
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span><strong>Czas realizacji</strong> – ile dni potrzebuje twórca na przygotowanie produktu</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span><strong>Dostępność</strong> – czy produkt jest gotowy do wysyłki, czy tworzony na zamówienie</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span><strong>Opcje personalizacji</strong> – czy możesz dostosować produkt do swoich potrzeb</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowToBuyContent
