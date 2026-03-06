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

const guideSections = [
  {
    title: "Jak zacząć?",
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg text-[#3B3634] mb-2 font-instrument-sans">
            <span className="text-[#3B3634]/40 font-normal mr-2">
              1.
            </span>
            Załóż konto sprzedawcy
          </h3>
          <p>
            Kliknij w przycisk &ldquo;Twój sklep&rdquo; (lub ikonkę
            sklepu na urządeniach mobilnych) i wypełnij krótki
            formularz rejestracyjny. Zgłoszenie zostanie zatwierdzone
            przez administratora platformy.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#3B3634] mb-2 font-instrument-sans">
            <span className="text-[#3B3634]/40 font-normal mr-2">
              2.
            </span>
            Uzupełnij wymagane dane
          </h3>
          <p className="mb-3">
            Po zatwierdzeniu konta zaloguj się do panelu sprzedawcy i
            uzupełnij wszystkie niezbędne informacje:
          </p>
          <ul className="list-disc ml-5 space-y-1.5 text-[#3B3634]/80">
            <li>
              dane sprzedawcy (imię i nazwisko lub nazwa firmy, NIP –
              jeśli dotyczy)
            </li>
            <li>dane kontaktowe (adres e-mail, numer telefonu)</li>
            <li>
              numer konta bankowego do wypłat (w walucie PLN)
            </li>
            <li>adres do zwrotów i reklamacji</li>
            <li>
              politykę zwrotów (np. formularz odstąpienia od umowy)
            </li>
            <li>
              dodatkowe informacje wymagane przepisami o
              bezpieczeństwie produktów (GPSR)
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#3B3634] mb-2 font-instrument-sans">
            <span className="text-[#3B3634]/40 font-normal mr-2">
              3.
            </span>
            Dodaj produkty do swojego sklepu
          </h3>
          <p className="mb-3">
            Każdy produkt powinien zawierać nazwę, dokładny opis, cenę
            brutto, zdjęcia dobrej jakości, informację o dostępności
            (np. gotowy / na zamówienie), przewidywany czas realizacji,
            a także dostępne formy dostawy i ich koszty.
          </p>

          <div className="mt-4 pl-4 border-l-2 border-[#3B3634]/15">
            <h4 className="font-semibold text-[#3B3634] mb-2 font-instrument-sans">
              Proces weryfikacji
            </h4>
            <p className="mb-3">
              Każdy nowy produkt jest weryfikowany przez
              administratora. Sprawdzamy zgodność oferty z zasadami
              platformy – m.in. jakość zdjęć, kompletność opisu oraz
              autorski charakter produktu.
            </p>
            <p className="mb-2">Administrator może:</p>
            <ul className="list-disc ml-5 space-y-1.5 text-[#3B3634]/80">
              <li>
                poprosić o poprawki techniczne (np. dodanie zdjęcia w
                wyższej rozdzielczości)
              </li>
              <li>
                odrzucić produkt, jeśli nie spełnia standardów
                jakościowych
              </li>
              <li>
                zablokować ofertę, jeśli nie jest to rękodzieło, lecz
                przedmiot pochodzący z dropshippingu lub produkcji
                masowej
              </li>
            </ul>
            <p className="mt-3">
              Weryfikacja ma na celu utrzymanie wysokiego poziomu
              oferty i zapewnienie unikalności produktów dostępnych na
              Artovni.
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-[#3B3634] mb-2 font-instrument-sans">
            <span className="text-[#3B3634]/40 font-normal mr-2">
              4.
            </span>
            Rozpocznij sprzedaż
          </h3>
          <p>
            Po dodaniu produktów Twój sklep będzie widoczny na stronie,
            a zamówienia pojawią się w Twoim panelu sprzedawcy. O
            każdej sprzedaży poinformujemy Cię mailowo i przez system.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Warunki współpracy",
    content: (
      <ul className="list-disc ml-5 space-y-2.5 text-[#3B3634]/80">
        <li>
          Założenie i prowadzenie konta sprzedawcy jest całkowicie
          bezpłatne.
        </li>
        <li>
          Prowizja pobierana jest wyłącznie w przypadku sprzedaży i
          wynosi 20% brutto.
        </li>
        <li>
          Wszystkie płatności obsługiwane są przez bezpieczny system
          Stripe.
        </li>
        <li>
          Środki zrealizowanych zamówień są przekazywane na konto
          bankowe sprzedawcy zgodnie z harmonogramem wypłat.
        </li>
      </ul>
    ),
  },
  {
    title: "Zwroty i reklamacje",
    content: (
      <div className="space-y-4">
        <p>
          Zgodnie z obowiązującym prawem, każdy sprzedawca ma
          obowiązek umożliwić klientowi zwrot towaru w terminie 14 dni
          od otrzymania przesyłki, z wyjątkiem produktów wykonywanych
          na zamówienie lub personalizowanych.
        </p>
        <div>
          <p className="mb-2">Sprzedawca musi:</p>
          <ul className="list-disc ml-5 space-y-1.5 text-[#3B3634]/80">
            <li>
              udostępnić adres do zwrotów (może się różnić od adresu
              kontaktowego)
            </li>
            <li>
              obsługiwać zwroty i reklamacje zgodnie z ustawą o
              prawach konsumenta
            </li>
            <li>
              udostępnić klientowi formularz zwrotu (lub przyjąć go
              przez panel klienta)
            </li>
          </ul>
        </div>
        <p>
          Reklamacje są rozpatrywane bezpośrednio między klientem a
          sprzedawcą.
        </p>
      </div>
    ),
  },
  {
    title: "Obowiązki informacyjne – GPSR",
    content: (
      <div className="space-y-4">
        <p>
          Zgodnie z Rozporządzeniem UE w sprawie ogólnego
          bezpieczeństwa produktów (GPSR), obowiązującym od 13 grudnia
          2024 r., sprzedawca ma obowiązek:
        </p>
        <ul className="list-disc ml-5 space-y-1.5 text-[#3B3634]/80">
          <li>
            opisać sposób bezpiecznego użytkowania produktu (np.
            ograniczenia wiekowe)
          </li>
          <li>
            wskazać kraj pochodzenia (np. &ldquo;Produkt wykonany w
            Polsce&rdquo;)
          </li>
          <li>
            zamieścić dane kontaktowe (imię i nazwisko lub nazwę
            firmy, adres e-mail)
          </li>
          <li>informować o potencjalnych zagrożeniach</li>
          <li>
            na żądanie organów nadzoru lub platformy przedstawić
            informacje potwierdzające bezpieczeństwo produktów
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Dlaczego warto sprzedawać na Artovni?",
    content: (
      <ul className="list-disc ml-5 space-y-2.5 text-[#3B3634]/80">
        <li>
          Możliwość dotarcia do klientów szukających oryginalnych i
          ręcznie tworzonych produktów
        </li>
        <li>
          Promocja twórców i produktów w kanałach społecznościowych i
          kampaniach reklamowych
        </li>
        <li>Przejrzysty i uczciwy model rozliczeń</li>
        <li>
          Intuicyjny panel do zarządzania produktami i zamówieniami
        </li>
        <li>Brak opłat na start i żadnych kosztów stałych</li>
      </ul>
    ),
  },
]

const SellingGuideContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26))

  return (
    <div className="selling-guide-content">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Jak sprzedawać na Artovni?
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Wszystko, czego potrzebujesz, aby otworzyć własny sklep i
          dołączyć do naszej społeczności twórców
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
              Artovnia to polska platforma stworzona z myślą o
              artystach, projektantach i rękodzielnikach, którzy chcą
              prezentować i sprzedawać swoje{" "}
              <strong className="text-[#3B3634] font-semibold">
                autorskie produkty
              </strong>{" "}
              w przyjaznym i uczciwym środowisku. Jeśli tworzysz
              unikatowe przedmioty – takie jak biżuteria, obrazy,
              ceramika, odzież, dekoracje czy ilustracje – możesz
              łatwo otworzyć własny sklep i dołączyć do naszej
              społeczności twórców.
            </p>
          </div>
        </ArtCard>

        {/* Guide Sections Accordion */}
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
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Przewodnik krok po kroku
            </h2>
          </div>

          <div className="space-y-0">
            {guideSections.map((section, index) => (
              <Disclosure
                key={index}
                as="div"
                className={`border-b border-[#3B3634]/10 ${
                  index === 0 ? "border-t" : ""
                }`}
                defaultOpen={index === 0}
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center text-left py-6 group">
                      <h3 className="text-lg font-semibold font-instrument-sans text-[#3B3634] pr-4 group-hover:text-[#3B3634]/80 transition-colors duration-200">
                        <span className="text-[#3B3634]/40 mr-3 font-normal">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </h3>
                      <div
                        className={`flex-shrink-0 w-8 h-8 border border-[#3B3634]/20 flex items-center justify-center transition-all duration-300 ${
                          open
                            ? "bg-[#3B3634] border-[#3B3634]"
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
                    <Disclosure.Panel className="pb-6 pl-9 text-[#3B3634]/90 font-instrument-sans leading-relaxed">
                      {section.content}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </ArtCard>

        {/* Footer CTA */}
        <ArtCard className="text-center">
          <h2 className="font-instrument-serif text-2xl md:text-3xl font-normal italic text-[#3B3634] mb-4">
            Zacznij sprzedawać już dziś
          </h2>
          <p className="text-[#3B3634]/80 font-instrument-sans mb-4 max-w-lg mx-auto leading-relaxed">
            Kliknij w przycisk &ldquo;Twój sklep&rdquo; (lub ikonka
            sklepu na urządzeniach mobilnych), wypełnij formularz
            rejestracyjny i dołącz do społeczności twórców Artovni.
          </p>
          <BrushDivider className="my-6" />
 <p className="text-[#3B3634]/50 font-instrument-sans text-sm italic">
           Jeśli masz pytania, zajrzyj do sekcji FAQ dla sprzedawców
            lub skontaktuj się z nami na{" "}
          

      
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



        
        </ArtCard>
      </div>
    </div>
  )
}

export default SellingGuideContent