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

const privacySections = [
  {
    title: "Postanowienia ogólne",
    content: (
      <div className="space-y-3">
        <p>
          1.1. Niniejsza polityka prywatności określa zasady
          przetwarzania i ochrony danych osobowych Użytkowników
          korzystających z platformy internetowej dostępnej pod
          adresem: www.artovnia.com (dalej: &quot;Serwis&quot;).
        </p>
        <p>
          1.2. Administratorem danych osobowych przetwarzanych w
          ramach Serwisu jest ..., prowadzący/a działalność
          gospodarczą pod firmą Ann Sayuri ART Anna Wawrzyniak z
          siedzibą przy ul. Leszczyńskiego 4/29, 50-078 Wrocław NIP:
          9261642417 REGON: 522385177 (dalej:
          &quot;Administrator&quot;).
        </p>
        <p>
          1.3. Dane osobowe przetwarzane są zgodnie z przepisami
          obowiązującego prawa, w tym Rozporządzeniem Parlamentu
          Europejskiego i Rady (UE) 2016/679 (RODO).
        </p>
        <p>
          1.4. Podanie danych osobowych jest dobrowolne, jednak ich
          niepodanie może uniemożliwić korzystanie z niektórych
          funkcjonalności Serwisu, w tym założenie konta czy
          dokonanie zakupu.
        </p>
        <p>
          1.5. Administrator dokłada wszelkich starań, aby zapewnić
          najwyższy poziom ochrony danych osobowych Użytkowników.
        </p>
      </div>
    ),
  },
  {
    title: "Zakres przetwarzania danych osobowych",
    content: (
      <div className="space-y-3">
        <p>
          Przez przetwarzanie danych rozumie się czynności i operacje
          wykonywane na danych Użytkowników, w tym przechowywanie,
          czy analizowanie na potrzeby usług Serwisu.
        </p>
        <p>
          2.1. Administrator przetwarza dane Użytkowników w
          następujących przypadkach:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            <strong className="text-[#3B3634]">
              Rejestracja konta:
            </strong>{" "}
            imię, nazwisko, e-mail, numer telefonu, hasło, login,
            dane adresowe, opcjonalnie: numer konta bankowego,
            zdjęcie profilowe.
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Realizacja transakcji:
            </strong>{" "}
            dane niezbędne do zawarcia i realizacji umowy sprzedaży
            (w tym adres dostawy, dane kontaktowe kupującego i
            sprzedającego).
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Obsługa klienta:
            </strong>{" "}
            dane przekazywane przy kontakcie z działem wsparcia.
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Formularze kontaktowe i wiadomości wewnętrzne:
            </strong>{" "}
            dane niezbędne do komunikacji pomiędzy Użytkownikami.
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Dane techniczne:
            </strong>{" "}
            adres IP, identyfikatory urządzeń, dane o przeglądarce,
            dane lokalizacyjne, dane dotyczące aktywności na stronie.
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Dane promocyjne:
            </strong>{" "}
            udział w konkursach i akcjach marketingowych.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Cele i podstawy prawne przetwarzania",
    content: (
      <div className="space-y-3">
        <p>
          Dane osobowe są przetwarzane przez Administratora w celu
          zapewnienia Użytkownikom pełnej funkcjonalności Serwisu
          oraz realizacji umów zawieranych w jego ramach.
          Przetwarzanie odbywa się w oparciu o jedną lub więcej
          podstaw prawnych przewidzianych w art. 6 RODO. Cele te
          obejmują:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            <strong className="text-[#3B3634]">
              Realizacja umowy lub działania przed zawarciem umowy
              (art. 6 ust. 1 lit. b RODO)
            </strong>{" "}
            – dane są przetwarzane w celu umożliwienia rejestracji
            konta, składania zamówień, zawierania i realizacji umów
            sprzedaży oraz świadczenia usług drogą elektroniczną;
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Wypełnienie obowiązków prawnych ciążących na
              Administratorze (art. 6 ust. 1 lit. c RODO)
            </strong>{" "}
            – takich jak obowiązki podatkowe, rachunkowe,
            archiwizacyjne, wynikające z przepisów prawa;
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Prawnie uzasadniony interes Administratora (art. 6
              ust. 1 lit. f RODO)
            </strong>{" "}
            – np. zapewnienie bezpieczeństwa Serwisu,
            przeciwdziałanie oszustwom, dochodzenie roszczeń,
            analiza działania platformy, personalizacja treści,
            marketing bezpośredni własnych usług;
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Zgoda Użytkownika (art. 6 ust. 1 lit. a RODO)
            </strong>{" "}
            – w sytuacjach, gdy przetwarzanie nie wynika z powyższych
            podstaw, a jest realizowane w celach marketingowych,
            przesyłania newslettera, czy profilowania preferencji
            zakupowych Użytkownika.
          </li>
        </ul>
        <p>
          Administrator może przetwarzać dane osobowe także w
          następujących celach:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            prowadzenia korespondencji i obsługi zapytań
            przesyłanych przez formularz kontaktowy,
          </li>
          <li>
            prowadzenia analiz statystycznych, które pozwalają na
            optymalizację działania Serwisu,
          </li>
          <li>
            personalizacji treści reklamowych oraz oferty Serwisu,
          </li>
          <li>
            organizacji konkursów, programów lojalnościowych i akcji
            promocyjnych,
          </li>
          <li>obsługi reklamacji i zgłoszeń użytkowników,</li>
          <li>
            zapewnienia rozliczalności i zgodności działań
            Administratora z przepisami RODO.
          </li>
        </ul>
        <p>
          W każdej sytuacji, gdy podstawą przetwarzania jest zgoda,
          Użytkownik ma prawo do jej cofnięcia w dowolnym momencie,
          bez wpływu na zgodność z prawem przetwarzania przed
          cofnięciem zgody.
        </p>
      </div>
    ),
  },
  {
    title: "Odbiorcy danych",
    content: (
      <div className="space-y-3">
        <p>Administrator może udostępniać dane osobowe:</p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>operatorom płatności,</li>
          <li>firmom kurierskim i logistycznym,</li>
          <li>
            dostawcom usług IT, hostingu, narzędzi marketingowych i
            analitycznych,
          </li>
          <li>biurom rachunkowym i kancelariom prawnym,</li>
          <li>
            sprzedającym w Serwisie w zakresie realizacji zamówień,
          </li>
          <li>
            organom państwowym, w przypadkach przewidzianych prawem.
          </li>
        </ul>
        <p>
          Dane mogą być przekazywane poza EOG tylko w sposób zgodny z
          RODO (np. na podstawie standardowych klauzul umownych).
        </p>
      </div>
    ),
  },
  {
    title: "Prawa Użytkownika",
    content: (
      <div className="space-y-3">
        <p>
          5.1. Każdemu Użytkownikowi przysługuje prawo do:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            <strong className="text-[#3B3634]">
              dostępu do danych osobowych
            </strong>{" "}
            – w tym uzyskania informacji o celach, zakresie i
            sposobie przetwarzania danych oraz otrzymania kopii
            przetwarzanych danych,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              sprostowania danych
            </strong>{" "}
            – poprawienia lub uzupełnienia nieprawidłowych lub
            niekompletnych danych,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              usunięcia danych
            </strong>{" "}
            – jeżeli przetwarzanie nie jest już konieczne lub
            Użytkownik cofnął zgodę (tzw. &quot;prawo do bycia
            zapomnianym&quot;),
          </li>
          <li>
            <strong className="text-[#3B3634]">
              ograniczenia przetwarzania
            </strong>{" "}
            – np. w przypadku zakwestionowania prawidłowości danych
            lub sprzeciwu względem ich przetwarzania,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              przenoszenia danych
            </strong>{" "}
            – w tym otrzymania danych w ustrukturyzowanym,
            powszechnie używanym formacie oraz przekazania ich
            innemu administratorowi,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              wniesienia sprzeciwu
            </strong>{" "}
            – wobec przetwarzania danych w celach wynikających z
            prawnie uzasadnionego interesu Administratora, w tym w
            celach marketingu bezpośredniego,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              cofnięcia zgody
            </strong>{" "}
            – w dowolnym momencie, bez wpływu na zgodność z prawem
            przetwarzania dokonanego przed jej cofnięciem,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              złożenia skargi
            </strong>{" "}
            – do Prezesa Urzędu Ochrony Danych Osobowych, jeżeli
            Użytkownik uzna, że przetwarzanie danych narusza
            przepisy RODO.
          </li>
        </ul>
        <p>
          5.2. Administrator ma obowiązek udzielenia odpowiedzi na
          każde żądanie realizacji praw Użytkownika w terminie nie
          dłuższym niż miesiąc od jego otrzymania. W przypadku
          skomplikowanego charakteru żądania termin ten może zostać
          przedłużony o kolejne dwa miesiące, o czym Użytkownik
          zostanie poinformowany.
        </p>
        <p>
          5.3. Realizacja żądań Użytkownika jest co do zasady
          bezpłatna. Administrator może jednak pobrać rozsądną opłatę
          za ponowne udzielenie informacji lub realizację nadmiernych
          bądź ewidentnie nieuzasadnionych żądań.
        </p>
        <p>
          5.4. W celu realizacji powyższych praw, Użytkownik może
          skontaktować się z Administratorem drogą elektroniczną,
          pisemnie lub poprzez formularz kontaktowy dostępny na
          stronie Serwisu.
        </p>
      </div>
    ),
  },
  {
    title: "Cookies i technologie śledzące",
    content: (
      <div className="space-y-3">
        <p>
          6.1. Serwis korzysta z plików cookies oraz narzędzi
          analitycznych i marketingowych w celach:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>zapewnienia prawidłowego działania Serwisu,</li>
          <li>zapamiętywania preferencji Użytkownika,</li>
          <li>
            prowadzenia statystyk dotyczących korzystania z Serwisu,
          </li>
          <li>personalizacji treści i reklam,</li>
          <li>prowadzenia działań remarketingowych.</li>
        </ul>
        <p>
          6.2. Pliki cookies (tzw. &quot;ciasteczka&quot;) to
          niewielkie pliki tekstowe zapisywane w urządzeniu
          Użytkownika podczas korzystania z Serwisu. Cookies mogą
          pochodzić od Administratora (cookies własne) lub od
          podmiotów trzecich (cookies zewnętrzne), takich jak Google,
          Meta (Facebook), czy narzędzia reklamowe.
        </p>
        <p>
          6.3. W ramach Serwisu stosowane są następujące rodzaje
          cookies:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            <strong className="text-[#3B3634]">Niezbędne</strong> –
            umożliwiające prawidłowe działanie Serwisu,
          </li>
          <li>
            <strong className="text-[#3B3634]">Funkcjonalne</strong>{" "}
            – zapamiętujące preferencje Użytkownika,
          </li>
          <li>
            <strong className="text-[#3B3634]">Analityczne</strong>{" "}
            – zbierające dane statystyczne o korzystaniu z Serwisu,
          </li>
          <li>
            <strong className="text-[#3B3634]">Marketingowe</strong>{" "}
            – umożliwiające wyświetlanie spersonalizowanych reklam,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Społecznościowe
            </strong>{" "}
            – wspierające interakcje z mediami społecznościowymi (np.
            przyciski Facebooka).
          </li>
        </ul>
        <p>
          6.4. Administrator może korzystać z następujących narzędzi
          zewnętrznych:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            <strong className="text-[#3B3634]">
              Google Analytics
            </strong>{" "}
            – do analizy ruchu i zachowań użytkowników,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Meta Pixel (Facebook Pixel)
            </strong>{" "}
            – do pomiaru skuteczności kampanii reklamowych,
          </li>
          <li>
            <strong className="text-[#3B3634]">
              Google Ads i Meta Ads
            </strong>{" "}
            – do emisji reklam dopasowanych do preferencji
            Użytkownika.
          </li>
        </ul>
        <p>
          6.5. Użytkownik może zarządzać plikami cookies za pomocą
          ustawień swojej przeglądarki internetowej oraz narzędzia do
          zarządzania cookies udostępnionego przez Serwis (jeśli
          dostępne).
        </p>
        <p>
          6.6. Użytkownik ma możliwość zablokowania zapisywania
          cookies, jednak może to wpłynąć na działanie niektórych
          funkcji Serwisu.
        </p>
        <p>
          6.7. Szczegółowe informacje o plikach cookies i narzędziach
          zewnętrznych można znaleźć na stronach dostawców:
        </p>
        <p>
          Google:{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B3634] hover:text-[#3B3634]/70 underline underline-offset-4 transition-colors duration-200"
          >
            policies.google.com/technologies/partner-sites
          </a>
          <br />
          Meta:{" "}
          <a
            href="https://www.facebook.com/about/privacy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B3634] hover:text-[#3B3634]/70 underline underline-offset-4 transition-colors duration-200"
          >
            facebook.com/about/privacy
          </a>
        </p>
      </div>
    ),
  },
  {
    title: "Okres przechowywania danych",
    content: (
      <div className="space-y-3">
        <p>Dane osobowe przechowywane są:</p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>
            przez okres trwania umowy i do czasu przedawnienia
            roszczeń,
          </li>
          <li>
            do czasu cofnięcia zgody (jeśli przetwarzanie odbywa się
            na jej podstawie),
          </li>
          <li>
            przez okres wymagany przepisami prawa (np. 5 lat w
            przypadku dokumentacji księgowej).
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Bezpieczeństwo danych",
    content: (
      <div className="space-y-3">
        <p>
          Administrator zapewnia ochronę danych poprzez stosowanie
          odpowiednich środków technicznych i organizacyjnych, w tym:
        </p>
        <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80">
          <li>szyfrowanie SSL,</li>
          <li>kontrolę dostępu,</li>
          <li>systemy kopii zapasowych,</li>
          <li>aktualizacje oprogramowania.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Postanowienia końcowe",
    content: (
      <div className="space-y-3">
        <p>
          9.1. Polityka prywatności może ulegać zmianom. Aktualna
          wersja zawsze znajduje się w Serwisie.
        </p>
        <p>
          9.2. Serwis może zawierać odnośniki do stron zewnętrznych.
          Administrator nie odpowiada za politykę prywatności tych
          stron i zaleca zapoznanie się z ich regulacjami.
        </p>
        <p>
          9.3. W sprawach nieuregulowanych niniejszą Polityką
          Prywatności zastosowanie mają odpowiednie przepisy prawa, w
          tym RODO i ustawa o świadczeniu usług drogą elektroniczną.
        </p>
      </div>
    ),
  },
]

const PrivacyPolicyContent = () => {
  const [lastUpdated] = useState(new Date(2025, 1, 20))
  const [effectiveDate] = useState(new Date(2025, 10, 3))

  return (
    <div className="privacy-content">
      {/* Header */}
      <header className="mb-6 md:mb-12 text-center">
        <h1 className="font-instrument-serif text-4xl md:text-5xl lg:text-6xl mb-6 font-normal italic text-[#3B3634] tracking-tight">
          Polityka Prywatności
        </h1>
        <p className="text-lg md:text-xl text-[#3B3634]/60 font-instrument-sans mb-4 max-w-xl mx-auto leading-relaxed">
          Serwis Artovnia.com
        </p>
        <div className="text-sm text-[#3B3634]/40 font-instrument-sans space-y-0.5">
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

      <BrushDivider className="mb-6 md:mb-12" />

      <div className="max-w-none space-y-10">
        {/* Quick Info Card */}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="font-instrument-serif text-2xl font-normal italic text-[#3B3634] mb-4">
                Najważniejsze informacje
              </h2>
              <ul className="list-disc ml-5 space-y-2 text-[#3B3634]/80 font-instrument-sans leading-relaxed">
                <li>
                  Administratorem danych osobowych jest Ann Sayuri
                  ART Anna Wawrzyniak, ul. Leszczyńskiego 4/29,
                  50-078 Wrocław
                </li>
                <li>
                  Gromadzimy tylko dane niezbędne do realizacji
                  zamówień, obsługi klienta i funkcjonowania
                  platformy marketplace
                </li>
                <li>
                  Twoje dane są bezpieczne i nie udostępniamy ich
                  osobom trzecim bez podstawy prawnej
                </li>
                <li>
                  Masz prawo do dostępu, poprawiania, usunięcia,
                  ograniczenia przetwarzania i przenoszenia swoich
                  danych
                </li>
                <li>
                  Używamy plików cookies w celu poprawy działania
                  strony, analityki i marketingu
                </li>
                <li>
                  Możesz w każdej chwili cofnąć zgodę na
                  przetwarzanie danych lub wnieść sprzeciw
                </li>
              </ul>
            </div>
          </div>
        </ArtCard>

        {/* Policy Sections Accordion */}
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl md:text-4xl font-normal italic text-[#3B3634]">
              Pełna treść polityki
            </h2>
          </div>

          <div className="space-y-0">
            {privacySections.map((section, index) => (
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
                            ? "bg-[#3B3634]/10 border-[#3B3634]/10 text-white"
                            : "group-hover:border-[#3B3634]/40 text-white "
                        }`}
                      >
                        <CollapseIcon
                          size={14}
                          className={`transition-transform duration-300 ${
                            open
                              ? "transform rotate-180 "
                              : "text-white"
                          }`}
                        />
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pb-6 lg:pl-9 text-[#3B3634]/90 font-instrument-sans leading-relaxed">
                      {section.content}
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </ArtCard>

        {/* Footer Contact Card */}
        <ArtCard className="text-center">
          <h2 className="font-instrument-serif text-2xl md:text-3xl font-normal italic text-[#3B3634] mb-6">
            Administrator danych
          </h2>
          <div className="text-[#3B3634]/80 font-instrument-sans space-y-1 leading-relaxed">
            <p className="font-semibold text-[#3B3634]">
              Ann Sayuri ART Anna Wawrzyniak
            </p>
            <p>ul. Leszczyńskiego 4/29</p>
            <p>50-078 Wrocław</p>
            <BrushDivider className="my-5" />
            <p>
              E-mail:{" "}
              <span
                className="text-[#3B3634] hover:text-[#3B3634]/70 underline underline-offset-4 transition-colors duration-200 cursor-pointer"
                onClick={() =>
                  (window.location.href = atob(
                    "bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t"
                  ))
                }
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.location.href = atob(
                      "bWFpbHRvOmluZm8uYXJ0b3ZuaWFAZ21haWwuY29t"
                    )
                  }
                }}
              >
                {"info.artovnia" + "@" + "gmail.com"}
              </span>
            </p>
            <p>NIP: 9261642417</p>
            <p>REGON: 522385177</p>
          </div>
        </ArtCard>
      </div>
    </div>
  )
}

export default PrivacyPolicyContent