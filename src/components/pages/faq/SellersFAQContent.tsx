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
    className={`relative bg-white/50 backdrop-blur-sm border border-[#3B3634]/10 p-8 md:p-10 ${className}`}
  >
   
    {children}
  </div>
)

const sellersFaqItems = [
  {
    question: "Jak mogę założyć konto sprzedawcy?",
    answer: (
      <p>
        Wystarczy wejść na stronę Artovnia, w prawym górnym rogu
        kliknąć &ldquo;ZAŁÓŻ SKLEP&rdquo; i wypełnić formularz
        rejestracyjny, akceptując regulamin.
      </p>
    ),
  },
  {
    question: "Czy utworzenie i prowadzenie konta jest darmowe?",
    answer: (
      <p>
        Tak. Rejestracja konta sprzedawcy oraz dodawanie produktów jest
        całkowicie darmowe. Płacisz wyłącznie prowizję od sprzedaży.
      </p>
    ),
  },
  {
    question:
      "Czy mogę usunąć lub zamknąć konto w dowolnym momencie?",
    answer: (
      <p>
        Tak, konto można zawiesić lub poprosić o jego usunięcie w
        każdej chwili, kontaktując się z obsługą.
      </p>
    ),
  },
  {
    question: "Czy mogę zmienić nazwę sklepu?",
    answer: (
      <p>
        Tak — nazwę sklepu można zmienić w ustawieniach konta, o ile
        nie narusza ona regulaminu i nie podszywa się pod innych
        twórców.
      </p>
    ),
  },
  {
    question: "Czy mogę dodawać nieograniczoną liczbę produktów?",
    answer: (
      <p>Tak. Platforma nie nakłada limitów liczbowych.</p>
    ),
  },
  {
    question: "Jakie produkty mogę sprzedawać?",
    answer: (
      <p>
        Rękodzieło, sztukę, produkty designerskie oraz przedmioty
        tworzone indywidualnie lub w małych seriach — zgodnie z opisem
        kategorii na Artovnia i regulaminem.
      </p>
    ),
  },
  {
    question: "Czy mogę edytować produkt po jego opublikowaniu?",
    answer: (
      <p>
        Tak, możesz w każdej chwili zmienić zdjęcia, opis, cenę lub
        warianty.
      </p>
    ),
  },
  {
    question:
      "Czy mogę zawiesić sprzedaż bez zamykania sklepu?",
    answer: (
      <p>
        Tak, możesz ustawić przerwę (np. urlop), a Twoje produkty będą
        ukryte.
      </p>
    ),
  },
  {
    question: "Jaka jest prowizja Artovnia?",
    answer: (
      <>
        <p>
          Aktualnie obowiązuje promocja dla pierwszych 100 twórców —
          sprzedawcy, którzy dodadzą minimum 10 produktów, otrzymują
          prowizję 10% na okres 6 miesięcy.
        </p>
        <p>
          Po zakończeniu promocji prowizja wynosi 20% od ceny brutto
          produktu.
        </p>
        <p>
          Prowizja liczona jest wyłącznie od ceny produktu, bez kosztów
          wysyłki.
        </p>
      </>
    ),
  },
  {
    question: "Kiedy otrzymuję pieniądze za sprzedaż?",
    answer: (
      <>
        <p>
          Wypłaty realizowane są dwa razy w miesiącu — do 15. dnia oraz
          do ostatniego dnia miesiąca.
        </p>
        <p>
          Szczegółowe informacje dotyczące wypłat znajdziesz w
          regulaminie.
        </p>
      </>
    ),
  },
  {
    question: "Kto przetwarza płatności?",
    answer: (
      <p>
        Stripe — renomowany operator płatności online, który zapewnia
        bezpieczeństwo transakcji.
      </p>
    ),
  },
  {
    question: "Kto wystawia fakturę kupującemu?",
    answer: (
      <p>
        Sprzedawca. Umowa zawierana jest bezpośrednio między kupującym
        a Tobą. Artovnia nie wystawia faktur w Twoim imieniu.
      </p>
    ),
  },
  {
    question: "Jak odbywa się komunikacja z klientem?",
    answer: (
      <p>
        Artovnia posiada system wiadomości, który umożliwia swobodną
        komunikację między klientem a sprzedawcą.
      </p>
    ),
  },
  {
    question: "Kto ustala metody wysyłki i ceny dostawy?",
    answer: (
      <p>
        Sprzedawca — samodzielnie określasz koszt, czas realizacji i
        przewoźników w ustawieniach swojego sklepu.
      </p>
    ),
  },
  {
    question: "Kto odpowiada za wysyłkę zamówienia?",
    answer: (
      <p>Sprzedawca — to Ty pakujesz i nadajesz paczkę.</p>
    ),
  },
  {
    question: "Co jeśli paczka zaginie w transporcie?",
    answer: (
      <p>
        Sprzedawca odpowiada za proces reklamacji u przewoźnika oraz
        kontakt z kupującym.
      </p>
    ),
  },
  {
    question: "Kto obsługuje zwroty?",
    answer: (
      <>
        <p>
          Sprzedawca. Kupujący wysyła zwrot bezpośrednio do Ciebie.
        </p>
        <p>
          Zwrot środków do klienta realizowany jest przez Artovnię,
          natomiast sprzedawca zleca zwrot pieniędzy w panelu
          sprzedawcy.
        </p>
        <p>
          Artovnia udostępnia panel zwrotów, który ułatwia cały proces
          zarówno klientowi, jak i sprzedawcy.
        </p>
      </>
    ),
  },
  {
    question: "Czy każdy produkt podlega zwrotowi?",
    answer: (
      <p>
        Nie — np. produkty personalizowane nie podlegają zwrotowi,
        zgodnie z obowiązującym prawem konsumenckim.
      </p>
    ),
  },
  {
    question: "Kto rozpatruje reklamacje?",
    answer: (
      <p>
        Sprzedawca — to Ty przyjmujesz zgłoszenie, oceniasz je i
        udzielasz odpowiedzi klientowi.
      </p>
    ),
  },
  {
    question:
      "Gdzie mogę znaleźć instrukcję, jak sprzedawać na Artovnia?",
    answer: (
      <p>
        Na stronie znajduje się poradnik &ldquo;krok po kroku&rdquo;,
        dostępny w stopce lub w sekcji dla sprzedawców.
      </p>
    ),
  },
  {
    question: "Co zrobić, jeśli mam problem techniczny?",
    answer: (
      <p>
        Skontaktuj się z pomocą techniczną poprzez e-mail podany w
        regulaminie lub przez system wiadomości w panelu sprzedawcy.
      </p>
    ),
  },
  {
    question: "Jak Artovnia pomaga twórcom w promocji?",
    answer: (
      <p>
        Twoje prace mogą zostać pokazane na naszych social mediach, w
        płatnych reklamach, dedykowanych artykułach o Twojej twórczości
        oraz w wyróżnionych sekcjach na stronie (np. &ldquo;Sprzedawca
        tygodnia&rdquo;). Wybrane produkty mogą również pojawić się w
        artykułach na naszym blogu.
      </p>
    ),
  },
  {
    question:
      "Czy mogę sprzedawać na Artovnia bez posiadania firmy?",
    answer: (
      <p>
        Tak. Możesz sprzedawać w ramach działalności nierejestrowanej,
        zgodnie z obowiązującymi przepisami prawa.
      </p>
    ),
  },
  {
    question:
      "Dlaczego muszę podawać dane i weryfikować dowód osobisty?",
    answer: (
      <>
        <p>
          Współpracujemy z Stripe — renomowanym operatorem płatności.
          Zgodnie z obowiązującym prawem wymagana jest weryfikacja
          danych sprzedawców.
        </p>
        <p>
          Proces weryfikacji przeprowadzany jest bezpośrednio przez
          Stripe i odbywa się na ich stronie — Artovnia nie ma dostępu
          do tych danych.
        </p>
        <p>
          Dzięki Stripe możemy zapewnić bezpieczne płatności dla
          klientów oraz sprawne i bezpieczne wypłaty dla sprzedawców.
        </p>
      </>
    ),
  },
]

const SellersFAQContent = () => {
  const [lastUpdated] = useState(new Date(2025, 11, 29))

  return (
    <div className="sellers-faq-content">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          FAQ dla twórców
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Znajdziesz tutaj odpowiedzi na najczęściej zadawane pytania
          dotyczące sprzedaży na platformie Artovnia
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans">
          Ostatnia aktualizacja:{" "}
          {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
        </div>
      </header>

      <BrushDivider className="mb-12" />

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
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <p className="text-lg leading-relaxed text-[#3B3634]/80 font-instrument-sans">
              Poniżej znajdziesz odpowiedzi na najczęściej zadawane
              pytania{" "}
              <strong className="text-[#3B3634] font-semibold">
                dla twórców i sprzedawców
              </strong>
              . Dowiedz się jak założyć sklep, zarządzać produktami,
              realizować zamówienia i rozliczać sprzedaż.
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
            {sellersFaqItems.map((item, index) => (
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
                      <h3 className="text-lg font-semibold font-instrument-sans text-[#3B3634] pr-4 group-hover:text-[#3B3634]/80 transition-colors duration-200">
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
                    <Disclosure.Panel className="pb-6 pl-9 text-[#3B3634]/90 font-instrument-sans space-y-3 leading-relaxed">
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

export default SellersFAQContent