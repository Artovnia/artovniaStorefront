"use client"

import React, { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const AboutUsContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="about-us-content">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4 font-instrument-sans">
              Nasza historia
            </p>
            <h1 className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 mb-6 leading-tight">
              Tworzymy przestrzeń
              <br />
              <span className="text-primary">dla sztuki</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Artovnia to rodzinna inicjatywa, która powstała z pasji do sztuki,
              designu i rękodzieła. Łączymy artystów z miłośnikami piękna.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-instrument-serif text-2xl md:text-3xl font-medium text-gray-900 mb-6">
                Jak to się zaczęło?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Tworzymy ją my – Ania, artystka malarka, oraz Arek,
                  programista. Połączyliśmy nasze talenty, by stworzyć miejsce,
                  w którym twórcy mogą swobodnie prezentować i sprzedawać swoje
                  dzieła.
                </p>
                <p>
                  Wierzymy w autentyczność, kreatywność i wspieranie małych
                  twórców. Artovnia to nie tylko marketplace – to społeczność
                  ludzi, którzy cenią piękno i unikalność.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-instrument-sans text-sm">
                    Tworzone z pasji
                    <br />
                    od 2025 roku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-12 md:py-20 bg-[#3B3634]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-3 font-instrument-sans">
              Poznaj nas
            </p>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-medium text-white">
              Ludzie stojący za Artovnią
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {/* Ania */}
            <div className="group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-gray-700">
                <Image
                  src="/placeholder.webp"
                  alt="Ania - Artystka malarka"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-instrument-sans mb-2">
                    Współzałożycielka
                  </span>
                </div>
              </div>
              <h3 className="font-instrument-serif text-2xl font-medium text-white mb-2">
                Ania
              </h3>
              <p className="text-sm uppercase tracking-wider text-white mb-3 font-instrument-sans">
                Artystka malarka
              </p>
              <p className="text-gray-300 leading-relaxed">
                Wnosi do projektu swoją pasję do sztuki i kreatywne podejście do
                designu. Jej wizja artystyczna nadaje Artovnii unikalny
                charakter.
              </p>
            </div>

            {/* Arek */}
            <div className="group">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-gray-700">
                <Image
                  src="/placeholder.webp"
                  alt="Arek - Programista"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-instrument-sans mb-2">
                    Współzałożyciel
                  </span>
                </div>
              </div>
              <h3 className="font-instrument-serif text-2xl font-medium text-white mb-2">
                Arek
              </h3>
              <p className="text-sm uppercase tracking-wider text-white mb-3 font-instrument-sans">
                Programista
              </p>
              <p className="text-gray-300 leading-relaxed">
                Odpowiedzialny za techniczne aspekty platformy i zapewnienie
                najlepszego doświadczenia użytkowników na każdym kroku.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-medium text-gray-900 mb-4">
              Nasza misja
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Każdego dnia pracujemy nad tym, by Artovnia była najlepszym
              miejscem dla twórców i miłośników sztuki.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Wspieranie twórców",
                description: "Pomagamy lokalnym artystom dotrzeć do szerszego grona odbiorców",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                ),
                title: "Unikalne projekty",
                description: "Promujemy ręczną pracę i niepowtarzalne dzieła sztuki",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                ),
                title: "Społeczność",
                description: "Budujemy przestrzeń dla miłośników sztuki i rękodzieła",
              },
              {
                icon: (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: "Bezpieczeństwo",
                description: "Zapewniamy bezpieczną i przyjazną platformę handlową",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-[#3b3634] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-instrument-serif text-lg font-medium text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center text-sm text-gray-400 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </div>
    </div>
  )
}

export default AboutUsContent