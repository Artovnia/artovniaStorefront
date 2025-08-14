"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const PrivacyPolicyContent = () => {
  const t = useTranslations("privacy")
  const [lastUpdated] = useState(new Date(2025, 8, 15)) // October 15, 2023 (example date - update as needed)
  const [effectiveDate] = useState(new Date(2025, 8, 15)) // October 15, 2023 (example date - update as needed)

  return (
    <div className="privacy-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          {t("header")}
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            {t("effectiveDate")}:{" "}
            {format(effectiveDate, "d MMMM yyyy", { locale: pl })}
          </p>
          <p>
            {t("lastUpdated")}:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Quick Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-5 mb-10">
        <h2 className="font-medium text-lg mb-2">{t("quickInfo.title")}</h2>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
          <li>Administratorem danych osobowych jest Artovnia sp. z o.o.</li>
          <li>Gromadzimy tylko dane niezbędne do realizacji zamówień i obsługi klienta</li>
          <li>Twoje dane są bezpieczne i nie udostępniamy ich osobom trzecim bez podstawy prawnej</li>
          <li>Masz prawo do dostępu, poprawiania i usunięcia swoich danych</li>
          <li>Używamy plików cookies w celu poprawy działania naszej strony</li>
        </ul>
      </div>

      {/* Privacy Policy Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Section 1 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6" defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.general")}
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
                  1. Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem przez nich z usług oferowanych przez sklep internetowy Artovnia dostępny pod adresem artovnia.com.
                </p>
                <p>
                  2. Administratorem danych osobowych jest Artovnia sp. z o.o. z siedzibą w Warszawie (00-123), ul. Przykładowa 1, wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy dla m.st. Warszawy w Warszawie, XII Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem KRS 0000000000, NIP 0000000000, REGON 000000000, zwana dalej &ldquo;Administratorem&rdquo;.
                </p>
                <p>
                  3. Kontakt z Administratorem odbywa się poprzez:
                  <br />
                  a) adres poczty elektronicznej: kontakt@artovnia.com
                  <br />
                  b) telefonicznie pod numerem: +48 000 000 000
                </p>
                <p>
                  4. Administrator dokłada szczególnej staranności w celu ochrony interesów osób, których dane dotyczą, a w szczególności zapewnia, że zbierane przez niego dane są przetwarzane zgodnie z prawem, zbierane dla oznaczonych, zgodnych z prawem celów i niepoddawane dalszemu przetwarzaniu niezgodnemu z tymi celami.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 2 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.dataTypes")}
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
                  1. Administrator może przetwarzać następujące dane osobowe Użytkowników korzystających ze Sklepu Internetowego:
                </p>
                <p>
                  a) Imię i nazwisko
                  <br />
                  b) Adres e-mail
                  <br />
                  c) Numer telefonu
                  <br />
                  d) Adres dostawy (ulica, numer domu/mieszkania, kod pocztowy, miasto, kraj)
                  <br />
                  e) Adres zamieszkania/prowadzenia działalności/siedziby (jeżeli jest inny niż adres dostawy)
                  <br />
                  f) Numer NIP (w przypadku wystawiania faktury VAT dla przedsiębiorców)
                  <br />
                  g) Dane do logowania do Konta Klienta (login oraz hasło)
                </p>
                <p>
                  2. Administrator może również przetwarzać zanonimizowane dane eksploatacyjne związane z odwiedzaniem Sklepu Internetowego (tzw. dane techniczne):
                  <br />
                  a) Adres IP
                  <br />
                  b) Dane dotyczące urządzenia (typ urządzenia, system operacyjny, przeglądarka internetowa)
                  <br />
                  c) Historia przeglądania (odwiedzane strony, czas spędzony na stronie)
                  <br />
                  d) Źródło, z którego Użytkownik trafił na stronę Sklepu Internetowego
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 3 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.legalBasis")}
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
                  1. Dane osobowe Użytkowników są przetwarzane przez Administratora w następujących celach:
                </p>
                <p>
                  a) Realizacja umowy sprzedaży zawieranej za pośrednictwem Sklepu Internetowego (art. 6 ust. 1 lit. b RODO)
                  <br />
                  b) Prowadzenie Konta Klienta w Sklepie Internetowym (art. 6 ust. 1 lit. b RODO)
                  <br />
                  c) Rozpatrywanie reklamacji (art. 6 ust. 1 lit. c RODO)
                  <br />
                  d) Marketing produktów i usług Administratora (art. 6 ust. 1 lit. f RODO)
                  <br />
                  e) Analiza, statystyka i raportowanie w celach marketingowych (art. 6 ust. 1 lit. f RODO)
                  <br />
                  f) Ustalenie, dochodzenie lub obrona przed roszczeniami (art. 6 ust. 1 lit. f RODO)
                  <br />
                  g) Wypełnienie obowiązków prawnych ciążących na Administratorze, w szczególności podatkowych i rachunkowych (art. 6 ust. 1 lit. c RODO)
                </p>
                <p>
                  2. Podanie danych osobowych jest dobrowolne, ale niezbędne do realizacji umowy sprzedaży, prowadzenia Konta Klienta lub otrzymywania informacji o produktach i usługach Administratora.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 4 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.dataRetention")}
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
                  1. Dane osobowe Użytkowników będą przechowywane przez Administratora przez następujące okresy:
                </p>
                <p>
                  a) W przypadku realizacji umowy sprzedaży - przez okres niezbędny do wykonania umowy, a po tym czasie przez okres wymagany przez przepisy prawa lub dla realizacji ewentualnych roszczeń
                  <br />
                  b) W przypadku prowadzenia Konta Klienta - do momentu żądania usunięcia konta przez Użytkownika
                  <br />
                  c) W przypadku marketingu produktów i usług Administratora - do momentu wycofania zgody lub wniesienia sprzeciwu
                  <br />
                  d) W przypadku wypełnienia obowiązków prawnych ciążących na Administratorze - przez okres wymagany przez przepisy prawa
                  <br />
                  e) W przypadku ustalenia, dochodzenia lub obrony przed roszczeniami - przez okres przedawnienia roszczeń lub przez okres prowadzenia postępowania przez właściwe organy lub sądy w przypadku dochodzenia roszczeń
                </p>
                <p>
                  2. Po upływie okresów przechowywania, dane osobowe zostają usunięte lub zanonimizowane.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 5 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.recipients")}
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
                  1. Administrator może udostępniać dane osobowe Użytkowników następującym kategoriom odbiorców:
                </p>
                <p>
                  a) Podmiotom świadczącym usługi na rzecz Administratora, które są niezbędne do realizacji celów przetwarzania, w szczególności podmiotom świadczącym usługi IT, księgowe, prawne, marketingowe
                  <br />
                  b) Dostawcom usług płatności elektronicznych
                  <br />
                  c) Firmom kurierskim i pocztowym realizującym dostawy zamówień
                  <br />
                  d) Organom państwowym lub innym podmiotom uprawnionym na podstawie przepisów prawa
                </p>
                <p>
                  2. Administrator nie przekazuje danych osobowych Użytkowników poza Europejski Obszar Gospodarczy, z wyjątkiem sytuacji, gdy jest to niezbędne do realizacji celów przetwarzania i pod warunkiem zapewnienia odpowiedniego stopnia ochrony tych danych.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 6 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.userRights")}
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
                  1. Użytkownikowi przysługują następujące prawa związane z przetwarzaniem jego danych osobowych:
                </p>
                <p>
                  a) Prawo dostępu do swoich danych osobowych oraz otrzymania ich kopii
                  <br />
                  b) Prawo do sprostowania (poprawiania) swoich danych osobowych
                  <br />
                  c) Prawo do usunięcia swoich danych osobowych
                  <br />
                  d) Prawo do ograniczenia przetwarzania danych osobowych
                  <br />
                  e) Prawo do przenoszenia danych osobowych
                  <br />
                  f) Prawo do wniesienia sprzeciwu wobec przetwarzania danych osobowych
                  <br />
                  g) Prawo do cofnięcia zgody na przetwarzanie danych osobowych (jeżeli przetwarzanie odbywa się na podstawie zgody)
                  <br />
                  h) Prawo do wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony Danych Osobowych)
                </p>
                <p>
                  2. Aby skorzystać z powyższych praw, Użytkownik powinien skontaktować się z Administratorem, korzystając z danych kontaktowych wskazanych w § 1 pkt 3 niniejszej Polityki Prywatności.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 7 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.cookies")}
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
                  1. Sklep Internetowy wykorzystuje pliki cookies (ciasteczka), czyli niewielkie informacje tekstowe, przechowywane na urządzeniu końcowym Użytkownika (np. komputerze, tablecie, smartfonie).
                </p>
                <p>
                  2. W Sklepie Internetowym wykorzystywane są następujące rodzaje plików cookies:
                  <br />
                  a) Cookies niezbędne - pliki cookies, które są niezbędne do prawidłowego funkcjonowania Sklepu Internetowego
                  <br />
                  b) Cookies analityczne - pliki cookies umożliwiające zbieranie informacji o sposobie korzystania ze Sklepu Internetowego
                  <br />
                  c) Cookies funkcjonalne - pliki cookies umożliwiające zapamiętanie wybranych przez Użytkownika ustawień i personalizację interfejsu
                  <br />
                  d) Cookies reklamowe - pliki cookies umożliwiające dostarczanie Użytkownikom treści reklamowych bardziej dostosowanych do ich zainteresowań
                </p>
                <p>
                  3. Użytkownik może samodzielnie i w każdym czasie zmienić ustawienia dotyczące plików cookies, określając warunki ich przechowywania i uzyskiwania dostępu przez pliki cookies do urządzenia Użytkownika.
                </p>
                <p>
                  4. Sklep Internetowy może również wykorzystywać inne technologie o funkcjach podobnych lub tożsamych z cookies, takie jak Local Storage.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 8 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.security")}
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
                  1. Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo danych osobowych Użytkowników, w szczególności uniemożliwiające dostęp do nich osobom nieuprawnionym lub ich przetwarzanie z naruszeniem przepisów prawa, zapobiegające utracie danych, ich uszkodzeniu lub zniszczeniu.
                </p>
                <p>
                  2. W celu zapewnienia integralności i poufności danych, Administrator wdrożył procedury umożliwiające dostęp do danych osobowych jedynie osobom upoważnionym i jedynie w zakresie, w jakim jest to niezbędne ze względu na wykonywane przez nie zadania.
                </p>
                <p>
                  3. Administrator stosuje rozwiązania organizacyjne i techniczne w celu zapewnienia, że wszystkie operacje na danych osobowych są rejestrowane i dokonywane tylko przez osoby uprawnione.
                </p>
                <p>
                  4. Administrator podejmuje wszelkie niezbędne działania, by podmioty współpracujące z nim dawały gwarancję stosowania odpowiednich środków bezpieczeństwa w każdym przypadku, gdy przetwarzają dane osobowe na zlecenie Administratora.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 9 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  {t("sections.final")}
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
                  1. Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności. Zmiany wchodzą w życie z chwilą opublikowania zmienionej Polityki Prywatności na stronie Sklepu Internetowego.
                </p>
                <p>
                  2. Administrator nie ponosi odpowiedzialności za politykę ochrony prywatności stosowaną przez właścicieli lub administratorów serwisów, do których przekierowują linki umieszczone w Sklepie Internetowym.
                </p>
                <p>
                  3. W sprawach nieuregulowanych w niniejszej Polityce Prywatności mają zastosowanie powszechnie obowiązujące przepisy prawa polskiego, w szczególności Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych) oraz ustawa z dnia 10 maja 2018 r. o ochronie danych osobowych.
                </p>
                <p>
                  4. Niniejsza Polityka Prywatności obowiązuje od dnia 15.10.2023 r.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Footer with Contact Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">{t("contactInfo.company")}</p>
          <p>{t("contactInfo.address")}</p>
          <p>{t("contactInfo.email")}</p>
          <p>{t("contactInfo.phone")}</p>
          <p>{t("contactInfo.taxId")}</p>
          <p>{t("contactInfo.regon")}</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyContent
