"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const SellingGuideContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="selling-guide-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Jak sprzedawać na Artovni?
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Introduction */}
      <div className="bg-primary/5 border border-primary/20 rounded-md p-6 mb-10">
        <p className="text-lg leading-relaxed">
          Artovnia to polska platforma stworzona z myślą o artystach, projektantach i rękodzielnikach, 
          którzy chcą prezentować i sprzedawać swoje autorskie produkty w przyjaznym i uczciwym środowisku. 
          Jeśli tworzysz unikatowe przedmioty – takie jak biżuteria, obrazy, ceramika, odzież, dekoracje 
          czy ilustracje – możesz łatwo otworzyć własny sklep i dołączyć do naszej społeczności twórców.
        </p>
      </div>

      {/* Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Section 1 - Jak zacząć */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6" defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  Jak zacząć?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">1. Załóż konto sprzedawcy</h3>
                  <p>
                    Kliknij w przycisk &ldquo;Załóż sklep&rdquo; i wypełnij krótki formularz rejestracyjny. 
                    Zgłoszenie zostanie zatwierdzone przez administratora platformy.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">2. Uzupełnij wymagane dane</h3>
                  <p className="mb-2">
                    Po zatwierdzeniu konta zaloguj się do panelu sprzedawcy i uzupełnij wszystkie niezbędne informacje:
                  </p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>dane sprzedawcy (imię i nazwisko lub nazwa firmy, NIP – jeśli dotyczy)</li>
                    <li>dane kontaktowe (adres e-mail, numer telefonu)</li>
                    <li>numer konta bankowego do wypłat (w walucie PLN)</li>
                    <li>adres do zwrotów i reklamacji</li>
                    <li>politykę zwrotów (np. formularz odstąpienia od umowy)</li>
                    <li>dodatkowe informacje wymagane przepisami o bezpieczeństwie produktów (GPSR)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">3. Dodaj produkty do swojego sklepu</h3>
                  <p className="mb-2">
                    Każdy produkt powinien zawierać nazwę, dokładny opis, cenę brutto, zdjęcia dobrej jakości, 
                    informację o dostępności (np. gotowy / na zamówienie), przewidywany czas realizacji, 
                    a także dostępne formy dostawy i ich koszty.
                  </p>
                  
                  <div className="mt-3">
                    <h4 className="font-medium mb-2">Proces weryfikacji</h4>
                    <p className="mb-2">
                      Każdy nowy produkt jest weryfikowany przez administratora. Sprawdzamy zgodność oferty 
                      z zasadami platformy – m.in. jakość zdjęć, kompletność opisu oraz autorski charakter produktu.
                    </p>
                    
                    <p className="mb-2">Administrator może:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>poprosić o poprawki techniczne (np. dodanie zdjęcia w wyższej rozdzielczości)</li>
                      <li>odrzucić produkt, jeśli nie spełnia standardów jakościowych</li>
                      <li>zablokować ofertę, jeśli nie jest to rękodzieło, lecz przedmiot pochodzący z dropshippingu lub produkcji masowej</li>
                    </ul>
                    
                    <p className="mt-2">
                      Weryfikacja ma na celu utrzymanie wysokiego poziomu oferty i zapewnienie unikalności 
                      produktów dostępnych na Artovni.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">4. Rozpocznij sprzedaż</h3>
                  <p>
                    Po dodaniu produktów Twój sklep będzie widoczny na stronie, a zamówienia pojawią się 
                    w Twoim panelu sprzedawcy. O każdej sprzedaży poinformujemy Cię mailowo i przez system.
                  </p>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 4 - Warunki współpracy */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  Warunki współpracy
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <ul className="list-disc ml-5 space-y-2">
                  <li>Założenie i prowadzenie konta sprzedawcy jest całkowicie bezpłatne.</li>
                  <li>Prowizja pobierana jest wyłącznie w przypadku sprzedaży i wynosi 25% brutto.</li>
                  <li>Wszystkie płatności obsługiwane są przez bezpieczny system Stripe.</li>
                  <li>Środki zrealizowanych zamówień są przekazywane na konto bankowe sprzedawcy zgodnie z harmonogramem wypłat.</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 5 - Zwroty i reklamacje */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  Zwroty i reklamacje
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-4">
                <p>
                  Zgodnie z obowiązującym prawem, każdy sprzedawca ma obowiązek umożliwić klientowi zwrot towaru 
                  w terminie 14 dni od otrzymania przesyłki, z wyjątkiem produktów wykonywanych na zamówienie 
                  lub personalizowanych.
                </p>
                
                <div>
                  <p className="mb-2">Sprzedawca musi:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>udostępnić adres do zwrotów (może się różnić od adresu kontaktowego)</li>
                    <li>obsługiwać zwroty i reklamacje zgodnie z ustawą o prawach konsumenta</li>
                    <li>udostępnić klientowi formularz zwrotu (lub przyjąć go przez panel klienta)</li>
                  </ul>
                </div>
                
                <p>
                  Reklamacje są rozpatrywane bezpośrednio między klientem a sprzedawcą.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 6 - GPSR */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  Obowiązki informacyjne – GPSR
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-4">
                <p>
                  Zgodnie z Rozporządzeniem UE w sprawie ogólnego bezpieczeństwa produktów (GPSR), 
                  obowiązującym od 13 grudnia 2024 r., sprzedawca ma obowiązek:
                </p>
                
                <ul className="list-disc ml-5 space-y-1">
                  <li>opisać sposób bezpiecznego użytkowania produktu (np. ograniczenia wiekowe)</li>
                  <li>wskazać kraj pochodzenia (np. &ldquo;Produkt wykonany w Polsce&rdquo;)</li>
                  <li>zamieścić dane kontaktowe (imię i nazwisko lub nazwę firmy, adres e-mail)</li>
                  <li>informować o potencjalnych zagrożeniach</li>
                  <li>na żądanie organów nadzoru lub platformy przedstawić informacje potwierdzające bezpieczeństwo produktów</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 7 - Dlaczego warto */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  Dlaczego warto sprzedawać na Artovni?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <ul className="list-disc ml-5 space-y-2">
                  <li>Możliwość dotarcia do klientów szukających oryginalnych i ręcznie tworzonych produktów</li>
                  <li>Promocja twórców i produktów w kanałach społecznościowych i kampaniach reklamowych</li>
                  <li>Przejrzysty i uczciwy model rozliczeń</li>
                  <li>Intuicyjny panel do zarządzania produktami i zamówieniami</li>
                  <li>Brak opłat na start i żadnych kosztów stałych</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Call to Action */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-primary/5 border border-primary/20 rounded-md p-6 text-center">
          <h2 className="text-xl font-medium mb-3">Zacznij sprzedawać już dziś</h2>
          <p className="text-gray-700 mb-4">
            Kliknij w przycisk &ldquo;Załóż sklep&rdquo;, wypełnij formularz rejestracyjny i dołącz do społeczności twórców Artovni.
          </p>
          <p className="text-sm text-gray-600">
            Jeśli masz pytania, zajrzyj do sekcji FAQ dla sprzedawców lub skontaktuj się z nami – chętnie pomożemy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SellingGuideContent
