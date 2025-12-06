"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const SellersFAQContent = () => {
  const [lastUpdated] = useState(new Date(2025, 8, 26)) // August 26, 2025

  return (
    <div className="sellers-faq-content">
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
        <h2 className="text-xl font-medium mb-3">Dla twórców (sprzedawców)</h2>
        <p className="text-gray-700">
          Znajdziesz tutaj odpowiedzi na najczęściej zadawane pytania dotyczące sprzedaży na platformie Artovnia.
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
                  1. Jak mogę założyć konto sprzedawcy?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Wystarczy wejść na stronę Artovnia, w prawym górnym rogu kliknąć
                  „TWÓJ SKLEP” i wypełnić formularz rejestracyjny, akceptując
                  regulamin.
                </p>
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
                  2. Czy utworzenie i prowadzenie konta jest darmowe?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak. Rejestracja konta sprzedawcy oraz dodawanie produktów jest
                  całkowicie darmowe. Płacisz wyłącznie prowizję od sprzedaży.
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
                  3. Czy mogę usunąć lub zamknąć konto w dowolnym momencie?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak, konto można zawiesić lub poprosić o jego usunięcie w każdej
                  chwili, kontaktując się z obsługą.
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
                  4. Czy mogę zmienić nazwę sklepu?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak — nazwę sklepu można zmienić w ustawieniach konta, o ile nie
                  narusza ona regulaminu i nie podszywa się pod innych twórców.
                </p>
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
                  5. Czy mogę dodawać nieograniczoną liczbę produktów?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>Tak. Platforma nie nakłada limitów liczbowych.</p>
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
                  6. Jakie produkty mogę sprzedawać?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Rękodzieło, sztukę, produkty designerskie oraz przedmioty tworzone
                  indywidualnie lub w małych seriach — zgodnie z opisem kategorii na
                  Artovnia i regulaminem.
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
                  7. Czy mogę edytować produkt po jego opublikowaniu?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak, możesz w każdej chwili zmienić zdjęcia, opis, cenę lub
                  warianty.
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
                  8. Czy mogę zawiesić sprzedaż bez zamykania sklepu?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Tak, możesz ustawić przerwę (np. urlop), a Twoje produkty będą
                  ukryte.
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
                  9. Jaka jest prowizja Artovnia?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Prowizja jest pobierana tylko od sprzedaży i jej wysokość wynosi
                  20% od ceny brutto + VAT.
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
                  10. Kiedy otrzymuję pieniądze za sprzedaż?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Wypłaty realizowane są w cyklu miesięcznym, do 8 dnia kolejnego
                  miesiąca. Przykład: wypłatę za sprzedaż w listopadzie otrzymasz do
                  8 grudnia.
                </p>
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
                  11. Kto przetwarza płatności?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Stripe — uznany operator płatności online, który zapewnia
                  bezpieczeństwo transakcji.
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
                  12. Kto wystawia fakturę kupującemu?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca. Umowa zawierana jest bezpośrednio między kupującym a
                  Tobą. Artovnia nie wystawia faktur w Twoim imieniu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 13 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  13. Jak odbywa się komunikacja z klientem?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Artovnia ma system wiadomości, który umożliwia swobodną
                  komunikację między klientem a sprzedawcą.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 14 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  14. Kto ustala metody wysyłki i ceny dostawy?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca — samodzielnie określasz koszt, czas realizacji i
                  przewoźników w ustawieniach swojego sklepu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 15 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  15. Kto odpowiada za wysyłkę zamówienia?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca — to Ty pakujesz i nadajesz paczkę.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 16 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  16. Co jeśli paczka zaginie w transporcie?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca odpowiada za proces reklamacji u przewoźnika oraz
                  kontakt z kupującym.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 17 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  17. Kto obsługuje zwroty?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca. Kupujący wysyła zwrot bezpośrednio do Ciebie. Artovnia
                  udostępnia panel zwrotów, dzięki któremu klient może zgłosić zwrot
                  przez swoje konto, a sprzedawca zatwierdza i zleca zwrot pieniędzy.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 18 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  18. Czy każdy produkt podlega zwrotowi?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Nie — np. produkty personalizowane nie podlegają zwrotowi,
                  zgodnie z prawem konsumenckim.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 19 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  19. Kto rozpatruje reklamacje?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Sprzedawca — to Ty przyjmujesz zgłoszenie, oceniasz je i
                  udzielasz odpowiedzi.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 20 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  20. Gdzie mogę znaleźć instrukcję, jak sprzedawać na Artovnia?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Na stronie znajduje się poradnik „krok po kroku”, dostępny w
                  stopce lub w sekcji dla sprzedawców.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 21 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  21. Co zrobić, jeśli mam problem techniczny?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Skontaktuj się z pomocą techniczną poprzez e-mail podany w
                  regulaminie lub przez system wiadomości w panelu sprzedawcy.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Question 22 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  22. Jak Artovnia pomaga twórcom w promocji?
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${open ? "transform rotate-180" : ""} text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>
                  Twoje prace mogą zostać pokazane na naszych social mediach,
                  płatnych reklamach, w dedykowanych artykułach o Twojej
                  twórczości oraz w wyróżnionych sekcjach na stronie (np.
                  „Sprzedawca tygodnia”). Wybrane produkty mogą również trafić do
                  naszych artykułów blogowych.
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

export default SellersFAQContent
