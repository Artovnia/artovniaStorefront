"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const PrivacyPolicyContent = () => {
  const [lastUpdated] = useState(new Date(2025, 10, 3)) // November 3, 2025
  const [effectiveDate] = useState(new Date(2025, 10, 3)) // November 3, 2025

  return (
    <div className="privacy-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          Polityka Prywatności serwisu Artovnia.com
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Data wejścia w życie:{" "}
            {format(effectiveDate, "d MMMM yyyy", { locale: pl })}
          </p>
          <p>
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Quick Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-5 mb-10">
        <h2 className="font-medium text-lg mb-2">Najważniejsze informacje</h2>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
          <li>Administratorem danych osobowych jest Ann Sayuri ART Anna Wawrzyniak, ul. Leszczyńskiego 4/29, 50-078 Wrocław</li>
          <li>Gromadzimy tylko dane niezbędne do realizacji zamówień, obsługi klienta i funkcjonowania platformy marketplace</li>
          <li>Twoje dane są bezpieczne i nie udostępniamy ich osobom trzecim bez podstawy prawnej</li>
          <li>Masz prawo do dostępu, poprawiania, usunięcia, ograniczenia przetwarzania i przenoszenia swoich danych</li>
          <li>Używamy plików cookies w celu poprawy działania strony, analityki i marketingu</li>
          <li>Możesz w każdej chwili cofnąć zgodę na przetwarzanie danych lub wnieść sprzeciw</li>
        </ul>
      </div>

      {/* Privacy Policy Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Section 1 - Postanowienia ogólne */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6" defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  1. Postanowienia ogólne
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
                  1.1. Niniejsza polityka prywatności określa zasady przetwarzania i ochrony danych osobowych Użytkowników korzystających z platformy internetowej dostępnej pod adresem: www.artovnia.com (dalej: &quot;Serwis&quot;).
                </p>
                <p>
                  1.2. Administratorem danych osobowych przetwarzanych w ramach Serwisu jest ..., prowadzący/a działalność gospodarczą pod firmą Ann Sayuri ART Anna Wawrzyniak z siedzibą przy ul. Leszczyńskiego 4/29, 50-078 Wrocław NIP: 9261642417  REGON: 522385177 (dalej: &quot;Administrator&quot;).
                </p>
                <p>
                  1.3. Dane osobowe przetwarzane są zgodnie z przepisami obowiązującego prawa, w tym Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).
                </p>
                <p>
                  1.4. Podanie danych osobowych jest dobrowolne, jednak ich niepodanie może uniemożliwić korzystanie z niektórych funkcjonalności Serwisu, w tym założenie konta czy dokonanie zakupu.
                </p>
                <p>
                  1.5. Administrator dokłada wszelkich starań, aby zapewnić najwyższy poziom ochrony danych osobowych Użytkowników.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 2 - Zakres przetwarzania danych osobowych */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  2. Zakres przetwarzania danych osobowych
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
                  Przez przetwarzanie danych rozumie się czynności i operacje wykonywane na danych Użytkowników, w tym przechowywanie, czy analizowanie na potrzeby usług Serwisu.
                </p>
                <p>
                  2.1. Administrator przetwarza dane Użytkowników w następujących przypadkach:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Rejestracja konta:</strong> imię, nazwisko, e-mail, numer telefonu, hasło, login, dane adresowe, opcjonalnie: numer konta bankowego, zdjęcie profilowe.</li>
                  <li><strong>Realizacja transakcji:</strong> dane niezbędne do zawarcia i realizacji umowy sprzedaży (w tym adres dostawy, dane kontaktowe kupującego i sprzedającego).</li>
                  <li><strong>Obsługa klienta:</strong> dane przekazywane przy kontakcie z działem wsparcia.</li>
                  <li><strong>Formularze kontaktowe i wiadomości wewnętrzne:</strong> dane niezbędne do komunikacji pomiędzy Użytkownikami.</li>
                  <li><strong>Dane techniczne:</strong> adres IP, identyfikatory urządzeń, dane o przeglądarce, dane lokalizacyjne, dane dotyczące aktywności na stronie.</li>
                  <li><strong>Dane promocyjne:</strong> udział w konkursach i akcjach marketingowych.</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 3 - Cele i podstawy prawne przetwarzania */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  3. Cele i podstawy prawne przetwarzania
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
                  Dane osobowe są przetwarzane przez Administratora w celu zapewnienia Użytkownikom pełnej funkcjonalności Serwisu oraz realizacji umów zawieranych w jego ramach. Przetwarzanie odbywa się w oparciu o jedną lub więcej podstaw prawnych przewidzianych w art. 6 RODO. Cele te obejmują:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Realizacja umowy lub działania przed zawarciem umowy (art. 6 ust. 1 lit. b RODO)</strong> – dane są przetwarzane w celu umożliwienia rejestracji konta, składania zamówień, zawierania i realizacji umów sprzedaży oraz świadczenia usług drogą elektroniczną;</li>
                  <li><strong>Wypełnienie obowiązków prawnych ciążących na Administratorze (art. 6 ust. 1 lit. c RODO)</strong> – takich jak obowiązki podatkowe, rachunkowe, archiwizacyjne, wynikające z przepisów prawa;</li>
                  <li><strong>Prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO)</strong> – np. zapewnienie bezpieczeństwa Serwisu, przeciwdziałanie oszustwom, dochodzenie roszczeń, analiza działania platformy, personalizacja treści, marketing bezpośredni własnych usług;</li>
                  <li><strong>Zgoda Użytkownika (art. 6 ust. 1 lit. a RODO)</strong> – w sytuacjach, gdy przetwarzanie nie wynika z powyższych podstaw, a jest realizowane w celach marketingowych, przesyłania newslettera, czy profilowania preferencji zakupowych Użytkownika.</li>
                </ul>
                <p>
                  Administrator może przetwarzać dane osobowe także w następujących celach:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>prowadzenia korespondencji i obsługi zapytań przesyłanych przez formularz kontaktowy,</li>
                  <li>prowadzenia analiz statystycznych, które pozwalają na optymalizację działania Serwisu,</li>
                  <li>personalizacji treści reklamowych oraz oferty Serwisu,</li>
                  <li>organizacji konkursów, programów lojalnościowych i akcji promocyjnych,</li>
                  <li>obsługi reklamacji i zgłoszeń użytkowników,</li>
                  <li>zapewnienia rozliczalności i zgodności działań Administratora z przepisami RODO.</li>
                </ul>
                <p>
                  W każdej sytuacji, gdy podstawą przetwarzania jest zgoda, Użytkownik ma prawo do jej cofnięcia w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed cofnięciem zgody.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 4 - Odbiorcy danych */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  4. Odbiorcy danych
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
                  Administrator może udostępniać dane osobowe:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>operatorom płatności,</li>
                  <li>firmom kurierskim i logistycznym,</li>
                  <li>dostawcom usług IT, hostingu, narzędzi marketingowych i analitycznych,</li>
                  <li>biurom rachunkowym i kancelariom prawnym,</li>
                  <li>sprzedającym w Serwisie w zakresie realizacji zamówień,</li>
                  <li>organom państwowym, w przypadkach przewidzianych prawem.</li>
                </ul>
                <p>
                  Dane mogą być przekazywane poza EOG tylko w sposób zgodny z RODO (np. na podstawie standardowych klauzul umownych).
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 5 - Prawa Użytkownika */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  5. Prawa Użytkownika
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
                  5.1. Każdemu Użytkownikowi przysługuje prawo do:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>dostępu do danych osobowych</strong> – w tym uzyskania informacji o celach, zakresie i sposobie przetwarzania danych oraz otrzymania kopii przetwarzanych danych,</li>
                  <li><strong>sprostowania danych</strong> – poprawienia lub uzupełnienia nieprawidłowych lub niekompletnych danych,</li>
                  <li><strong>usunięcia danych</strong> – jeżeli przetwarzanie nie jest już konieczne lub Użytkownik cofnął zgodę (tzw. &quot;prawo do bycia zapomnianym&quot;),</li>
                  <li><strong>ograniczenia przetwarzania</strong> – np. w przypadku zakwestionowania prawidłowości danych lub sprzeciwu względem ich przetwarzania,</li>
                  <li><strong>przenoszenia danych</strong> – w tym otrzymania danych w ustrukturyzowanym, powszechnie używanym formacie oraz przekazania ich innemu administratorowi,</li>
                  <li><strong>wniesienia sprzeciwu</strong> – wobec przetwarzania danych w celach wynikających z prawnie uzasadnionego interesu Administratora, w tym w celach marketingu bezpośredniego,</li>
                  <li><strong>cofnięcia zgody</strong> – w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej cofnięciem,</li>
                  <li><strong>złożenia skargi</strong> – do Prezesa Urzędu Ochrony Danych Osobowych, jeżeli Użytkownik uzna, że przetwarzanie danych narusza przepisy RODO.</li>
                </ul>
                <p>
                  5.2. Administrator ma obowiązek udzielenia odpowiedzi na każde żądanie realizacji praw Użytkownika w terminie nie dłuższym niż miesiąc od jego otrzymania. W przypadku skomplikowanego charakteru żądania termin ten może zostać przedłużony o kolejne dwa miesiące, o czym Użytkownik zostanie poinformowany.
                </p>
                <p>
                  5.3. Realizacja żądań Użytkownika jest co do zasady bezpłatna. Administrator może jednak pobrać rozsądną opłatę za ponowne udzielenie informacji lub realizację nadmiernych bądź ewidentnie nieuzasadnionych żądań.
                </p>
                <p>
                  5.4. W celu realizacji powyższych praw, Użytkownik może skontaktować się z Administratorem drogą elektroniczną, pisemnie lub poprzez formularz kontaktowy dostępny na stronie Serwisu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 6 - Cookies i technologie śledzące */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  6. Cookies i technologie śledzące
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
                  6.1. Serwis korzysta z plików cookies oraz narzędzi analitycznych i marketingowych w celach:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>zapewnienia prawidłowego działania Serwisu,</li>
                  <li>zapamiętywania preferencji Użytkownika,</li>
                  <li>prowadzenia statystyk dotyczących korzystania z Serwisu,</li>
                  <li>personalizacji treści i reklam,</li>
                  <li>prowadzenia działań remarketingowych.</li>
                </ul>
                <p>
                  6.2. Pliki cookies (tzw. &quot;ciasteczka&quot;) to niewielkie pliki tekstowe zapisywane w urządzeniu Użytkownika podczas korzystania z Serwisu. Cookies mogą pochodzić od Administratora (cookies własne) lub od podmiotów trzecich (cookies zewnętrzne), takich jak Google, Meta (Facebook), czy narzędzia reklamowe.
                </p>
                <p>
                  6.3. W ramach Serwisu stosowane są następujące rodzaje cookies:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Niezbędne</strong> – umożliwiające prawidłowe działanie Serwisu,</li>
                  <li><strong>Funkcjonalne</strong> – zapamiętujące preferencje Użytkownika,</li>
                  <li><strong>Analityczne</strong> – zbierające dane statystyczne o korzystaniu z Serwisu,</li>
                  <li><strong>Marketingowe</strong> – umożliwiające wyświetlanie spersonalizowanych reklam,</li>
                  <li><strong>Społecznościowe</strong> – wspierające interakcje z mediami społecznościowymi (np. przyciski Facebooka).</li>
                </ul>
                <p>
                  6.4. Administrator może korzystać z następujących narzędzi zewnętrznych:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><strong>Google Analytics</strong> – do analizy ruchu i zachowań użytkowników,</li>
                  <li><strong>Meta Pixel (Facebook Pixel)</strong> – do pomiaru skuteczności kampanii reklamowych,</li>
                  <li><strong>Google Ads i Meta Ads</strong> – do emisji reklam dopasowanych do preferencji Użytkownika.</li>
                </ul>
                <p>
                  6.5. Użytkownik może zarządzać plikami cookies za pomocą ustawień swojej przeglądarki internetowej oraz narzędzia do zarządzania cookies udostępnionego przez Serwis (jeśli dostępne).
                </p>
                <p>
                  6.6. Użytkownik ma możliwość zablokowania zapisywania cookies, jednak może to wpłynąć na działanie niektórych funkcji Serwisu.
                </p>
                <p>
                  6.7. Szczegółowe informacje o plikach cookies i narzędziach zewnętrznych można znaleźć na stronach dostawców:
                </p>
                <p>
                  Google: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/technologies/partner-sites</a>
                  <br />
                  Meta: <a href="https://www.facebook.com/about/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.facebook.com/about/privacy/</a>
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 7 - Okres przechowywania danych */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  7. Okres przechowywania danych
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
                  Dane osobowe przechowywane są:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>przez okres trwania umowy i do czasu przedawnienia roszczeń,</li>
                  <li>do czasu cofnięcia zgody (jeśli przetwarzanie odbywa się na jej podstawie),</li>
                  <li>przez okres wymagany przepisami prawa (np. 5 lat w przypadku dokumentacji księgowej).</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 8 - Bezpieczeństwo danych */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  8. Bezpieczeństwo danych
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
                  Administrator zapewnia ochronę danych poprzez stosowanie odpowiednich środków technicznych i organizacyjnych, w tym:
                </p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>szyfrowanie SSL,</li>
                  <li>kontrolę dostępu,</li>
                  <li>systemy kopii zapasowych,</li>
                  <li>aktualizacje oprogramowania.</li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 9 - Postanowienia końcowe */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  9. Postanowienia końcowe
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
                  9.1. Polityka prywatności może ulegać zmianom. Aktualna wersja zawsze znajduje się w Serwisie.
                </p>
                <p>
                  9.2. Serwis może zawierać odnośniki do stron zewnętrznych. Administrator nie odpowiada za politykę prywatności tych stron i zaleca zapoznanie się z ich regulacjami.
                </p>
                <p>
                  9.3. W sprawach nieuregulowanych niniejszą Polityką Prywatności zastosowanie mają odpowiednie przepisy prawa, w tym RODO i ustawa o świadczeniu usług drogą elektroniczną.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Footer with Contact Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Ann Sayuri ART Anna Wawrzyniak</p>
          <p>ul. Leszczyńskiego 4/29</p>
          <p>50-078 Wrocław</p>
          <p className="mt-2">E-mail: sayuri.platform@gmail.com</p>
          <p>NIP: 9261642417</p>
          <p>REGON: 522385177</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyContent