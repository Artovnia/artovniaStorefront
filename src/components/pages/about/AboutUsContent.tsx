"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const AboutUsContent = () => {
  const [lastUpdated] = useState(new Date(2024, 11, 13)) // December 13, 2024

  return (
    <div className="about-us-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          O nas
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
            Artovnia to rodzinna inicjatywa, która powstała z pasji do sztuki, designu i rękodzieła. 
            Tworzymy ją my – Ania, artystka malarka, oraz Arek, programista. Połączyliśmy nasze talenty, 
            by stworzyć miejsce, w którym twórcy mogą swobodnie prezentować i sprzedawać swoje dzieła, 
            a klienci – odkrywać wyjątkowe, ręcznie tworzone przedmioty.
          </p>
        </div>

        <div className="bg-[#3B3634] rounded-md p-8 shadow-sm border border-gray-100">
          <p className="text-lg leading-relaxed text-white mb-6">
            Wierzymy w autentyczność, kreatywność i wspieranie małych twórców. Artovnia to nie tylko marketplace – 
            to społeczność ludzi, którzy cenią piękno i unikalność.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <h3 className="font-instrument-serif text-xl font-medium mb-3 text-white">
                Ania
              </h3>
              <p className="text-white">
                Artystka malarka, która wnosi do projektu swoją pasję do sztuki i kreatywne podejście do designu.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-instrument-serif text-xl font-medium mb-3 text-white">
                Arek
              </h3>
              <p className="text-white">
                Programista odpowiedzialny za techniczne aspekty platformy i zapewnienie najlepszego doświadczenia użytkowników.
              </p>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="font-instrument-serif text-2xl font-medium mb-6 text-gray-800">
            Nasza misja
          </h2>
          <div className="bg-primary/5 border border-primary/20 rounded-md p-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Wspieranie lokalnych twórców i artystów</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Promowanie ręcznej pracy i unikalnych projektów</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Tworzenie społeczności miłośników sztuki i rękodzieła</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Zapewnienie bezpiecznej i przyjaznej platformy handlowej</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUsContent
