"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const DeliveryContent = () => {
  const [lastUpdated] = useState(new Date(2024, 11, 13)) // December 13, 2024

  return (
    <div className="delivery-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Formy dostawy
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
            Metody dostawy ustalane są indywidualnie przez twórców i mogą obejmować różne opcje wysyłki. 
            Każdy sprzedawca może oferować inne metody – szczegóły znajdziesz w koszyku lub w opisie produktu.
          </p>
        </div>

        <div className="space-y-8">
          {/* Available Delivery Methods */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Dostępne metody dostawy
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">📦</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Paczkomaty InPost</h3>
                  <p className="text-gray-600">
                    Wygodny odbiór z automatów paczkowych dostępnych 24/7 w całej Polsce. 
                    Otrzymasz SMS z kodem odbioru.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">🚚</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Kurier</h3>
                  <p className="text-gray-600">
                    Dostawa bezpośrednio pod wskazany adres przez różnych operatorów kurierskich. 
                    Możliwość umówienia dogodnego terminu dostawy.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">📮</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Poczta Polska</h3>
                  <p className="text-gray-600">
                    Tradycyjna przesyłka pocztowa z możliwością odbioru w placówce pocztowej 
                    lub dostawą do skrzynki pocztowej.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-amber-800">
              Ważne informacje
            </h2>
            
            <div className="space-y-4 text-amber-700">
              <div className="flex items-start">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Obecnie dostawy realizowane są wyłącznie na terenie Polski</span>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Odbiór osobisty nie jest dostępny</span>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Koszty dostawy ustalane są indywidualnie przez każdego sprzedawcę</span>
              </div>
              <div className="flex items-start">
                <span className="text-amber-600 mr-3 mt-1">•</span>
                <span>Dla zamówień od kilku sprzedawców każdy wysyła swoje produkty osobno</span>
              </div>
            </div>
          </div>

          {/* How to Choose Delivery */}
          <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Jak wybrać metodę dostawy?
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>1. W koszyku</strong> – po dodaniu produktów do koszyka zobaczysz dostępne opcje dostawy 
                dla każdego sprzedawcy osobno.
              </p>
              <p>
                <strong>2. W opisie produktu</strong> – informacje o dostępnych metodach wysyłki i ich kosztach 
                znajdziesz również na stronie produktu.
              </p>
              <p>
                <strong>3. Kontakt ze sprzedawcą</strong> – jeśli masz pytania dotyczące dostawy, możesz skontaktować 
                się bezpośrednio z twórcą przez system wiadomości.
              </p>
            </div>
          </div>

          {/* Delivery Times */}
          <div className="bg-primary/5 border border-primary/20 rounded-md p-8">
            <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
              Czasy dostawy
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="font-medium text-lg mb-2">Paczkomaty InPost</div>
                <div className="text-gray-600">1-2 dni robocze</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg mb-2">Kurier</div>
                <div className="text-gray-600">1-3 dni robocze</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-lg mb-2">Poczta Polska</div>
                <div className="text-gray-600">2-5 dni roboczych</div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-6 text-center">
              * Czasy dostawy mogą się różnić w zależności od sprzedawcy i czasu realizacji zamówienia
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryContent
