"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const SellersFAQContent = () => {
  const [lastUpdated] = useState(new Date(2024, 11, 13)) // December 13, 2024

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
                  1. Czy mogę założyć konto sprzedawcy za darmo?
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
                  Tak! Założenie konta i dodawanie produktów jest całkowicie darmowe. 
                  Prowizja 20% brutto + VAT pobierana jest tylko w momencie sprzedaży.
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
                  2. Jakie produkty mogę sprzedawać na Artovni?
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
                  Artovnia jest platformą dla twórców i artystów. Możesz sprzedawać:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>rękodzieło</li>
                  <li>dzieła sztuki</li>
                  <li>dekoracje</li>
                  <li>ubrania i dodatki</li>
                  <li>autorską biżuterię</li>
                  <li>ilustracje, grafiki, ceramikę i wiele innych</li>
                </ul>
                <p>
                  Nie akceptujemy produktów masowej produkcji, dropshippingu, ani importowanych przedmiotów bez ingerencji twórcy.
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
                  3. Jak dodawać produkty?
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
                  Po założeniu konta sprzedawcy możesz dodać produkty z poziomu swojego panelu. 
                  Do każdego produktu należy dodać:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>tytuł</li>
                  <li>opis</li>
                  <li>zdjęcia</li>
                  <li>cenę</li>
                  <li>informację o dostępności (od ręki / na zamówienie)</li>
                  <li>czas realizacji</li>
                  <li>opcje wysyłki</li>
                </ul>
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
                  4. Jakie są formy wysyłki?
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
                  To Ty decydujesz, jakie metody wysyłki oferujesz (np. InPost, Poczta Polska, kurier). 
                  Koszty i czas dostawy ustawiasz indywidualnie dla każdego produktu lub grupy produktów.
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
                  5. Jak otrzymam zapłatę za zamówienie?
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
                  Po zrealizowaniu zamówienia środki zostaną przelane na Twoje konto bankowe (po potrąceniu prowizji). 
                  Szczegóły dotyczące wypłat znajdziesz w swoim panelu.
                </p>
                <p>
                  Wypłaty są realizowane w cyklu miesięcznym, do 8 dnia kolejnego miesiąca za miesiąc poprzedni.
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
                  6. Czy mogę edytować swoje produkty?
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
                  Tak – w każdej chwili możesz edytować opis, cenę, zdjęcia, stany magazynowe, czas realizacji itd.
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
                  7. Czy mogę zawiesić swój sklep?
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
                  Tak. Jeśli planujesz przerwę, możesz tymczasowo zawiesić sklep w ustawieniach konta. 
                  Twoje produkty nie będą wtedy widoczne.
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
