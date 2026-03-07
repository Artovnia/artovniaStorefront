"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

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

const faqItems = [
  {
    question: "Czy muszę zakładać konto, żeby złożyć zamówienie?",
    answer: (
      <>
        <p>
          Nie, możesz kupować jako gość. Jednak rejestracja konta daje Ci
          dodatkowe korzyści:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>dostęp do historii i statusów zamówień</li>
          <li>możliwość zapisywania produktów do ulubionych</li>
          <li>łatwiejszą komunikację ze sprzedawcami</li>
          <li>
            dostęp do rabatów i promocji tylko dla zarejestrowanych
            użytkowników
          </li>
        </ul>
      </>
    ),
  },
  {
    question:
      "Czy mogę zamówić produkty od kilku twórców jednocześnie?",
    answer: (
      <p>
        Tak! Na Artovni możesz dodać do koszyka produkty od różnych
        sprzedawców i zrealizować je w jednym zamówieniu. System
        automatycznie podzieli je na odpowiednie części, a Ty zapłacisz
        jedną łączną kwotę. Dla każdego sprzedawcy wybierasz osobno
        metodę wysyłki.
      </p>
    ),
  },
  {
    question: "Jakie produkty mogę tu kupić?",
    answer: (
      <p>
        Na Artovni znajdziesz wyłącznie ręcznie tworzone przedmioty i
        autorskie projekty: biżuterię, obrazy, dekoracje, ceramikę,
        ubrania, dodatki do domu, zabawki, prezenty i wiele więcej.
        Każdy produkt jest wyjątkowy – tworzony z pasją przez
        niezależnych twórców.
      </p>
    ),
  },
  {
    question: "Jakie są dostępne formy płatności?",
    answer: (
      <>
        <p>
          Wszystkie płatności odbywają się za pośrednictwem systemu PayU
          i są w pełni bezpieczne. Możesz zapłacić:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>kartą płatniczą (debetową lub kredytową)</li>
          <li>BLIKiem</li>
          <li>szybkim przelewem online</li>
        </ul>
      </>
    ),
  },
  {
    question:
      "Czy mogę zapłacić za pobraniem lub przelewem tradycyjnym?",
    answer: (
      <p>
        Aktualnie nie oferujemy płatności za pobraniem ani przelewów
        tradycyjnych. Wszystkie zamówienia są opłacane z góry przez
        system płatności online.
      </p>
    ),
  },
  {
    question: "Jakie są opcje dostawy?",
    answer: (
      <>
        <p>
          Opcje dostawy ustalane są indywidualnie przez każdego twórcę.
          Najczęściej oferowane metody to:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Paczkomaty InPost</li>
          <li>kurier (różni operatorzy)</li>
          <li>Poczta Polska</li>
        </ul>
        <p>
          Informacje o dostępnych metodach dostawy oraz kosztach pojawią
          się w koszyku przy finalizacji zamówienia. Nie oferujemy
          odbiorów osobistych.
        </p>
      </>
    ),
  },
  {
    question: "Czy mogę śledzić przesyłkę?",
    answer: (
      <p>
        Tak, sprzedawcy udostępniają numer nadania przesyłki, który
        umożliwia śledzenie statusu dostawy.
      </p>
    ),
  },
  {
    question: "Ile trwa realizacja zamówienia?",
    answer: (
      <>
        <p>Czas realizacji zależy od sprzedawcy oraz rodzaju produktu:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            produkty &ldquo;od ręki&rdquo; są zazwyczaj wysyłane w
            ciągu 1–3 dni roboczych
          </li>
          <li>
            produkty personalizowane lub tworzone na zamówienie mogą mieć
            dłuższy czas realizacji (nawet do 14 dni)
          </li>
        </ul>
        <p>
          Dokładne informacje znajdziesz w opisie danego produktu.
        </p>
      </>
    ),
  },
  {
    question:
      "Czy mogę skontaktować się bezpośrednio ze sprzedawcą?",
    answer: (
      <p>
        Tak – jeśli masz konto na Artovni, możesz wysłać wiadomość do
        sprzedawcy przez nasz system komunikacji. Możesz dopytać o
        szczegóły, personalizację, termin wykonania itp.
      </p>
    ),
  },
  {
    question: "Czy mogę zwrócić produkt?",
    answer: (
      <>
        <p>
          Tak, zgodnie z prawem masz 14 dni na odstąpienie od umowy bez
          podania przyczyny – wyjątkiem są produkty:
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>wykonywane na indywidualne zamówienie</li>
          <li>personalizowane według Twoich wskazówek</li>
        </ul>
        <div>
          <p className="font-medium mb-2 text-[#3B3634]">
            Aby dokonać zwrotu:
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Wypełnij formularz zwrotu (link do pobrania znajdziesz na
              stronie)
            </li>
            <li>
              Wyślij go do sprzedawcy mailowo lub za pomocą systemu
              wiadomości
            </li>
            <li>Odeślij produkt zgodnie z instrukcją sprzedawcy</li>
          </ol>
        </div>
      </>
    ),
  },
  {
    question: "Jak złożyć reklamację?",
    answer: (
      <>
        <p>
          W przypadku wady produktu lub problemu z zamówieniem:
        </p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Skontaktuj się bezpośrednio ze sprzedawcą</li>
          <li>
            Opisz problem i załącz zdjęcia (jeśli to możliwe)
          </li>
          <li>
            Ustal szczegóły dalszego postępowania – zwrot, naprawa,
            wymiana itp.
          </li>
        </ol>
        <p>
          Formularz reklamacyjny znajdziesz na stronie – możesz z niego
          skorzystać w razie potrzeby.
        </p>
      </>
    ),
  },
  {
    question:
      "Czy mogę zamówić produkt jako prezent i dodać wiadomość?",
    answer: (
      <p>
        Wielu sprzedawców oferuje opcję pakowania na prezent i dodania
        dedykacji – zapytaj sprzedawcę przed zakupem lub sprawdź
        informacje w opisie produktu.
      </p>
    ),
  },
]

const FAQContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="faq-content">
      {/* Header */}
      <header className="mb-6 md:mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Najczęściej zadawane pytania
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Znajdziesz tutaj odpowiedzi na pytania dotyczące zakupów na
          platformie Artovnia
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-6 md:mb-12" />

      <div className="max-w-none space-y-10">
        {/* Intro Card */}
        <ArtCard>
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 hidden sm:flex w-14 h-14 border-2 border-[#3B3634]/30 items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-[#3B3634]/95 font-instrument-sans">
              Poniżej znajdziesz odpowiedzi na najczęściej zadawane
              pytania{" "}
              <strong className="text-[#3B3634] font-semibold">
                dla kupujących
              </strong>
              . Jeśli nie znajdziesz tutaj odpowiedzi na swoje pytanie,
              skontaktuj się z nami — chętnie pomożemy!
            </p>
          </div>
        </ArtCard>

        {/* FAQ Accordion */}
        <ArtCard>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 border-2 border-[#3B3634]/30 flex items-center justify-center">
              <svg
                className="w-7 h-7 stroke-[#3B3634]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Pytania i odpowiedzi
            </h2>
          </div>

          <div className="space-y-0">
            {faqItems.map((item, index) => (
              <Disclosure
                key={index}
                as="div"
                className={`border-b border-[#3B3634]/10 ${
                  index === 0 ? "border-t" : ""
                }`}
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center text-left py-6 group">
                      <h3 className="text-lg font-semibold font-instrument-sans text-[#3B3634] pr-4 group-hover:text-[#3B3634]/95 transition-colors duration-200">
                        <span className="text-[#3B3634]/40 mr-3 font-normal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.question}
                      </h3>
                      <div
                        className={`flex-shrink-0 w-8 h-8 border border-[#3B3634]/20 flex items-center justify-center transition-all duration-300 ${
                          open
                            ? "bg-[#3B3634]/10 border-[#3B3634]/10 text-white"
                            : "group-hover:border-[#3B3634]/40"
                        }`}
                      >
                        <CollapseIcon
                          size={14}
                          className={`transition-transform duration-300 ${
                            open
                              ? "transform rotate-180 text-white"
                              : "text-[#3B3634]/50"
                          }`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pb-6 lg:pl-9 text-[#3B3634]/90 font-instrument-sans space-y-3 leading-relaxed">
                      {item.answer}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </ArtCard>

        {/* Footer CTA */}
        <div className="text-center pt-2 pb-4">
          <BrushDivider className="mb-8" />
           <p className="text-[#3B3634]/50 font-instrument-sans text-sm italic">
            Nie znalazłeś odpowiedzi na swoje pytanie? Napisz do nas
            na{" "}
          

      
  E-mail:{" "}
  <span
    className="underline underline-offset-2 cursor-pointer hover:opacity-70 transition-opacity"
    onClick={() =>
      window.location.href =
        atob("bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t")
    }
    role="link"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        window.location.href =
          atob("bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t")
      }
    }}
  >
    {"info.artovnia" + "@" + "gmail.com"}
  </span>
</p>
        </div>
      </div>
    </div>
  )
}

export default FAQContent