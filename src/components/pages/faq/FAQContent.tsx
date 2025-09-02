"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const FAQContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="faq-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          FAQ – Najczęściej zadawane pytania
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Section Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-md p-6 mb-10">
        <h2 className="text-xl font-medium mb-3">Dla kupujących</h2>
        <p className="text-gray-700">
          Znajdziesz tutaj odpowiedzi na najczęściej zadawane pytania dotyczące zakupów na platformie Artovnia.
        </p>
      </div>

      {/* FAQ Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Question 1 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  1. Czy muszę zakładać konto, żeby złożyć zamówienie?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Nie, możesz kupować jako gość. Jednak rejestracja konta daje Ci dodatkowe korzyści:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>dostęp do historii i statusów zamówień</li>
                  <li>możliwość zapisywania produktów do ulubionych</li>
                  <li>łatwiejszą komunikację ze sprzedawcami</li>
                  <li>dostęp do rabatów i promocji tylko dla zarejestrowanych użytkowników</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 2 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  2. Czy mogę zamówić produkty od kilku twórców jednocześnie?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak! Na Artovni możesz dodać do koszyka produkty od różnych sprzedawców i zrealizować je w jednym zamówieniu. 
                  System automatycznie podzieli je na odpowiednie części, a Ty zapłacisz jedną łączną kwotę. 
                  Dla każdego sprzedawcy wybierasz osobno metodę wysyłki.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 3 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  3. Jakie produkty mogę tu kupić?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Na Artovni znajdziesz wyłącznie ręcznie tworzone przedmioty i autorskie projekty: biżuterię, obrazy, 
                  dekoracje, ceramikę, ubrania, dodatki do domu, zabawki, prezenty i wiele więcej. 
                  Każdy produkt jest wyjątkowy – tworzony z pasją przez niezależnych twórców.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 4 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  4. Jakie są dostępne formy płatności?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Wszystkie płatności odbywają się za pośrednictwem systemu PayU i są w pełni bezpieczne. Możesz zapłacić:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>kartą płatniczą (debetową lub kredytową)</li>
                  <li>BLIKiem</li>
                  <li>szybkim przelewem online</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 5 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  5. Czy mogę zapłacić za pobraniem lub przelewem tradycyjnym?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Aktualnie nie oferujemy płatności za pobraniem ani przelewów tradycyjnych. 
                  Wszystkie zamówienia są opłacane z góry przez system płatności online.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 6 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  6. Jakie są opcje dostawy?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Opcje dostawy ustalane są indywidualnie przez każdego twórcę. Najczęściej oferowane metody to:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Paczkomaty InPost</li>
                  <li>kurier (różni operatorzy)</li>
                  <li>Poczta Polska</li>
                </ul>
                <p>
                  Informacje o dostępnych metodach dostawy oraz kosztach pojawią się w koszyku przy finalizacji zamówienia. 
                  Nie oferujemy odbiorów osobistych.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 7 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  7. Czy mogę śledzić przesyłkę?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak, sprzedawcy udostępniają numer nadania przesyłki, który umożliwia śledzenie statusu dostawy.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 8 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  8. Ile trwa realizacja zamówienia?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Czas realizacji zależy od sprzedawcy oraz rodzaju produktu:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>produkty &ldquo;od ręki&rdquo; są zazwyczaj wysyłane w ciągu 1–3 dni roboczych</li>
                  <li>produkty personalizowane lub tworzone na zamówienie mogą mieć dłuższy czas realizacji (nawet do 14 dni)</li>
                </ul>
                <p>
                  Dokładne informacje znajdziesz w opisie danego produktu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 9 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  9. Czy mogę skontaktować się bezpośrednio ze sprzedawcą?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak – jeśli masz konto na Artovni, możesz wysłać wiadomość do sprzedawcy przez nasz system komunikacji. 
                  Możesz dopytać o szczegóły, personalizację, termin wykonania itp.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 10 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  10. Czy mogę zwrócić produkt?
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
                  Tak, zgodnie z prawem masz 14 dni na odstąpienie od umowy bez podania przyczyny – wyjątkiem są produkty:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>wykonywane na indywidualne zamówienie</li>
                  <li>personalizowane według Twoich wskazówek</li>
                </ul>
                
                <div>
                  <p className="font-medium mb-2">Aby dokonać zwrotu:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Wypełnij formularz zwrotu (link do pobrania znajdziesz na stronie)</li>
                    <li>Wyślij go do sprzedawcy mailowo lub za pomocą systemu wiadomości</li>
                    <li>Odeślij produkt zgodnie z instrukcją sprzedawcy</li>
                  </ol>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 11 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  11. Jak złożyć reklamację?
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
                  W przypadku wady produktu lub problemu z zamówieniem:
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Skontaktuj się bezpośrednio ze sprzedawcą</li>
                  <li>Opisz problem i załącz zdjęcia (jeśli to możliwe)</li>
                  <li>Ustal szczegóły dalszego postępowania – zwrot, naprawa, wymiana itp.</li>
                </ol>
                <p>
                  Formularz reklamacyjny znajdziesz na stronie – możesz z niego skorzystać w razie potrzeby.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 12 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  12. Czy mogę zamówić produkt jako prezent i dodać wiadomość?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Wielu sprzedawców oferuje opcję pakowania na prezent i dodania dedykacji – zapytaj sprzedawcę przed zakupem 
                  lub sprawdź informacje w opisie produktu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Contact Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-primary/5 border border-primary/20 rounded-md p-6 text-center">
          <h2 className="text-xl font-medium mb-3">Nie znalazłeś odpowiedzi na swoje pytanie?</h2>
          <p className="text-gray-700 mb-4">
            Skontaktuj się z nami – chętnie pomożemy!
          </p>
          <p className="text-sm text-gray-600">
            E-mail: kontakt@artovnia.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQContent
