"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const TermsOfUseContent = () => {
  const t = useTranslations("terms")
  const [lastUpdated] = useState(new Date(2025, 8, 15)) // October 15, 2025 (example date - update as needed)
  const [effectiveDate] = useState(new Date(2025, 8, 15)) // October 15, 2025 (example date - update as needed)

  return (
    <div className="terms-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          {t("header")}
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            {t("effectiveDate")}: {format(effectiveDate, "d MMMM yyyy", { locale: pl })}
          </p>
          <p>
            {t("lastUpdated")}: {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Quick Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-5 mb-10">
        <h2 className="font-medium text-lg mb-2">{t("quickInfo.title")}</h2>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
          <li>Artovnia sp. z o.o. prowadzi sklep internetowy pod adresem artovnia.com</li>
          <li>Zamówienia można składać 24 godziny na dobę przez cały rok</li>
          <li>Do złożenia zamówienia konieczne jest posiadanie aktywnego adresu e-mail</li>
          <li>Wszystkie ceny podane na stronie są cenami brutto (zawierają podatek VAT)</li>
          <li>Formy płatności określone są w trakcie procesu składania zamówienia</li>
        </ul>
      </div>

      {/* Terms Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Section 1 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  § 1. {t("section.general")}
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
                  1. Niniejszy Regulamin określa ogólne warunki, zasady oraz
                  sposób sprzedaży prowadzonej przez Artovnia sp. z o.o. z
                  siedzibą w Warszawie, za pośrednictwem sklepu internetowego
                  artovnia.com (zwanego dalej: &quot;Sklepem
                  Internetowym&quot;).
                </p>
                <p>
                  2. Właścicielem Sklepu Internetowego jest Artovnia sp. z o.o. z
                  siedzibą w Warszawie (00-123), ul. Przykładowa 1, wpisana do
                  rejestru przedsiębiorców Krajowego Rejestru Sądowego
                  prowadzonego przez Sąd Rejonowy dla m.st. Warszawy w Warszawie,
                  XII Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem
                  KRS 0000000000, NIP 0000000000, REGON 000000000, zwana dalej
                  &quot;Sprzedawcą&quot;.
                </p>
                <p>
                  3. Kontakt ze Sprzedawcą odbywa się poprzez:
                  <br />
                  a) adres poczty elektronicznej: kontakt@artovnia.com
                  <br />
                  b) telefonicznie pod numerem: +48 000 000 000
                </p>
                <p>
                  4. Niniejszy Regulamin jest nieprzerwanie dostępny na stronie
                  internetowej artovnia.com, w sposób umożliwiający jego
                  pozyskanie, odtwarzanie i utrwalanie jego treści poprzez
                  wydrukowanie lub zapisanie na nośniku w każdej chwili.
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
                  § 2. {t("section.definitions")}
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <p>Użyte w Regulaminie pojęcia oznaczają:</p>
                <p>
                  1. Klient – osoba fizyczna posiadająca pełną zdolność do
                  czynności prawnych, osoba prawna lub jednostka organizacyjna
                  nieposiadająca osobowości prawnej, która korzysta ze Sklepu
                  Internetowego;
                </p>
                <p>
                  2. Konsument – osoba fizyczna, dokonująca zakupów w Sklepie
                  Internetowym w zakresie niezwiązanym bezpośrednio z jej
                  działalnością gospodarczą lub zawodową;
                </p>
                <p>
                  3. Konto Klienta – oznaczony indywidualną nazwą (loginem) i
                  hasłem podanym przez Klienta, zbiór danych w systemie
                  teleinformatycznym Sprzedawcy, w którym gromadzone są dane
                  Klienta, w tym informacje o złożonych Zamówieniach;
                </p>
                <p>
                  4. Produkt – dostępna w Sklepie Internetowym rzecz ruchoma,
                  będąca przedmiotem umowy sprzedaży między Klientem a
                  Sprzedawcą;
                </p>
                <p>5. Regulamin – niniejszy regulamin Sklepu Internetowego;</p>
                <p>
                  6. Sklep Internetowy – serwis internetowy dostępny pod adresem
                  artovnia.com, za pośrednictwem którego Klient może dokonać
                  zakupu Produktów;
                </p>
                <p>
                  7. Sprzedawca – Artovnia sp. z o.o. z siedzibą w Warszawie
                  (00-123), ul. Przykładowa 1;
                </p>
                <p>
                  8. Zamówienie – oświadczenie woli Klienta, stanowiące ofertę
                  zawarcia umowy sprzedaży Produktów ze Sprzedawcą.
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
                  § 3. {t("section.usageRules")}
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
                  1. Korzystanie ze Sklepu Internetowego jest możliwe pod
                  warunkiem spełnienia przez system teleinformatyczny, z którego
                  korzysta Klient, następujących minimalnych wymagań
                  technicznych:
                  <br />
                  a) komputer lub urządzenie mobilne z dostępem do Internetu,
                  <br />
                  b) dostęp do poczty elektronicznej,
                  <br />
                  c) przeglądarka internetowa w aktualnej wersji,
                  <br />
                  d) włączenie w przeglądarce internetowej obsługi JavaScript
                  oraz plików cookies.
                </p>
                <p>
                  2. Korzystanie ze Sklepu Internetowego oznacza każdą czynność
                  Klienta, która prowadzi do zapoznania się przez niego z
                  treściami zawartymi w Sklepie Internetowym.
                </p>
                <p>
                  3. W celu złożenia Zamówienia w Sklepie Internetowym oraz
                  korzystania z innych usług dostępnych w Sklepie Internetowym,
                  konieczne jest posiadanie aktywnego konta poczty elektronicznej
                  (e-mail).
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
                  § 4. {t("section.salesProcedure")}
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
                  1. Aby założyć Konto Klienta, należy dokonać rejestracji w
                  Sklepie Internetowym. Rejestracja następuje poprzez
                  wypełnienie i zaakceptowanie formularza rejestracyjnego.
                </p>
                <p>
                  2. Warunkiem rejestracji jest wyrażenie zgody na treść
                  Regulaminu oraz podanie danych osobowych oznaczonych jako
                  obowiązkowe. Sprzedawca może pozbawić Klienta prawa do
                  korzystania ze Sklepu Internetowego poprzez zablokowanie lub
                  usunięcie jego Konta Klienta, w przypadku naruszenia przez
                  Klienta przepisów prawa lub postanowień Regulaminu.
                </p>
                <p>
                  3. Konto Klienta jest niezbywalne. Klient zobowiązany jest do
                  nieudostępniania danych dostępowych do swojego Konta Klienta
                  osobom trzecim.
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
                  § 5. {t("section.deliveryPayment")}
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
                  1. Informacje o Produktach prezentowane w Sklepie Internetowym
                  stanowią zaproszenie do zawarcia umowy w rozumieniu art. 71
                  Kodeksu cywilnego.
                </p>
                <p>
                  2. W celu złożenia Zamówienia, Klient powinien wykonać
                  następujące kroki:
                  <br />
                  a) dodać Produkt do koszyka,
                  <br />
                  b) wypełnić formularz zamówienia, wskazując dane niezbędne do
                  realizacji zamówienia, w tym dane do faktury (jeśli Klient
                  chce ją otrzymać),
                  <br />
                  c) wybrać sposób dostawy i sposób płatności,
                  <br />
                  d) zaakceptować Regulamin,
                  <br />
                  e) kliknąć przycisk &quot;Kupuję i płacę&quot;.
                </p>
                <p>
                  3. Zamówienia można składać 24 godziny na dobę, 7 dni w
                  tygodniu, przez cały rok.
                </p>
                <p>
                  4. Po złożeniu Zamówienia, Klient otrzymuje wiadomość e-mail,
                  zawierającą potwierdzenie wszystkich istotnych elementów
                  Zamówienia. Umowę sprzedaży traktuje się jako zawartą z momentem
                  otrzymania przez Klienta wiadomości e-mail, o której mowa w
                  zdaniu poprzedzającym.
                </p>
                <p>
                  5. W przypadku wyboru przez Klienta płatności przelewem,
                  płatności elektronicznych lub kartą płatniczą, Klient
                  zobowiązany jest do dokonania płatności w terminie 3 dni
                  roboczych od dnia zawarcia umowy sprzedaży, w przeciwnym razie
                  zamówienie zostanie anulowane.
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
                  § 6. {t("section.warranty")}
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
                  1. Ceny Produktów podawane są w złotych polskich i zawierają
                  wszystkie składniki, w tym podatek VAT oraz cła. Ceny nie
                  zawierają kosztów dostawy, które są wskazywane w trakcie
                  składania Zamówienia.
                </p>
                <p>
                  2. Klient ma możliwość dokonania płatności za zamówione
                  Produkty w następujący sposób:
                  <br />
                  a) przelewem na rachunek bankowy Sprzedawcy,
                  <br />
                  b) płatnością elektroniczną (system PayU, BLIK),
                  <br />
                  c) kartą płatniczą,
                  <br />
                  d) płatnością przy odbiorze (za pobraniem).
                </p>
                <p>
                  3. Sprzedawca zastrzega sobie prawo do zmiany cen Produktów
                  prezentowanych w Sklepie Internetowym, wprowadzania nowych
                  Produktów, wycofywania Produktów, przeprowadzania i
                  odwoływania akcji promocyjnych, bądź wprowadzania w nich zmian,
                  zgodnie z obowiązującymi przepisami prawa.
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
                  § 7. {t("section.complaints")}
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
                  1. Dostawa Produktów jest ograniczona do terytorium
                  Rzeczpospolitej Polskiej oraz odbywa się na adres wskazany
                  przez Klienta w trakcie składania Zamówienia.
                </p>
                <p>
                  2. Dostawa zamówionych Produktów odbywa się za pośrednictwem:
                  <br />
                  a) firmy kurierskiej,
                  <br />
                  b) Poczty Polskiej,
                  <br />
                  c) paczkomatów InPost.
                </p>
                <p>
                  3. Termin realizacji dostawy wynosi od 1 do 5 dni roboczych,
                  licząc od dnia zaksięgowania płatności na koncie Sprzedawcy.
                </p>
                <p>
                  4. Klient obowiązany jest do sprawdzenia stanu Produktu przy
                  dostawie w obecności kuriera/doręczyciela, w szczególności czy
                  zawartość paczki jest zgodna z przedmiotem zamówienia oraz czy
                  nie jest uszkodzona.
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
                  § 8. {t("section.contractWithdrawal")}
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
                  1. Sprzedawca odpowiada wobec Klienta za wady fizyczne i prawne
                  Produktu na zasadach określonych w Kodeksie cywilnym, w
                  szczególności w art. 556 i następnych Kodeksu cywilnego.
                </p>
                <p>
                  2. Reklamacje z tytułu rękojmi można składać:
                  <br />
                  a) drogą elektroniczną na adres e-mail:
                  reklamacje@artovnia.com,
                  <br />
                  b) pisemnie na adres siedziby Sprzedawcy.
                </p>
                <p>
                  3. Reklamacja powinna zawierać:
                  <br />
                  a) imię i nazwisko oraz adres do korespondencji osoby
                  składającej reklamację,
                  <br />
                  b) numer zamówienia lub faktury,
                  <br />
                  c) opis wady Produktu wraz z datą jej wystąpienia,
                  <br />
                  d) żądanie Klienta (naprawa, wymiana, obniżenie ceny,
                  odstąpienie od umowy).
                </p>
                <p>
                  4. Sprzedawca ustosunkuje się do złożonej reklamacji w terminie
                  14 dni od dnia jej otrzymania.
                </p>
                <p>
                  5. Konsument ma prawo odstąpić od umowy sprzedaży Produktu
                  zawartej ze Sprzedawcą za pośrednictwem Sklepu Internetowego,
                  bez podania jakiejkolwiek przyczyny i bez ponoszenia kosztów, z
                  wyjątkiem kosztów zwrotu Produktu, w terminie 14 dni od dnia
                  otrzymania Produktu.
                </p>
                <p>
                  6. Oświadczenie o odstąpieniu od umowy może być złożone w
                  jakiejkolwiek formie, w szczególności:
                  <br />
                  a) pisemnie na adres siedziby Sprzedawcy,
                  <br />
                  b) drogą elektroniczną na adres e-mail: zwroty@artovnia.com.
                </p>
                <p>
                  7. Konsument ma obowiązek zwrócić Produkt Sprzedawcy lub
                  przekazać go osobie upoważnionej przez Sprzedawcę do odbioru
                  niezwłocznie, jednak nie później niż 14 dni od dnia, w którym
                  odstąpił od umowy, chyba że Sprzedawca zaproponował, że sam
                  odbierze Produkt.
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
                  § 9. {t("section.dataProtection")}
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
                  1. Administratorem danych osobowych Klientów jest Sprzedawca.
                </p>
                <p>
                  2. Dane osobowe Klientów przetwarzane są w celu realizacji
                  umowy sprzedaży, prowadzenia Konta Klienta oraz ewentualnego
                  dochodzenia roszczeń.
                </p>
                <p>
                  3. Podanie danych osobowych przez Klienta jest dobrowolne, ale
                  niezbędne do realizacji umowy sprzedaży.
                </p>
                <p>
                  4. Klientowi przysługuje prawo dostępu do treści swoich danych
                  osobowych oraz prawo ich sprostowania, usunięcia, ograniczenia
                  przetwarzania, prawo do przenoszenia danych, prawo do
                  wniesienia sprzeciwu, prawo do cofnięcia zgody w dowolnym
                  momencie.
                </p>
                <p>
                  5. Szczegółowe informacje dotyczące przetwarzania danych
                  osobowych znajdują się w Polityce prywatności dostępnej na
                  stronie Sklepu Internetowego.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 10 */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  § 10. {t("section.finalProvisions")}
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
                  1. Umowy zawierane za pośrednictwem Sklepu Internetowego
                  zawierane są w języku polskim.
                </p>
                <p>
                  2. Sprzedawca zastrzega sobie prawo do dokonywania zmian
                  Regulaminu. Zmiany Regulaminu wchodzą w życie w terminie 7 dni
                  od daty ich opublikowania na stronie Sklepu Internetowego.
                  Zamówienia złożone przed datą wejścia w życie zmian do
                  Regulaminu są realizowane na podstawie postanowień
                  obowiązujących w dniu złożenia zamówienia.
                </p>
                <p>
                  3. W sprawach nieuregulowanych w Regulaminie mają zastosowanie
                  przepisy prawa polskiego, w szczególności Kodeksu cywilnego,
                  Ustawy o prawach konsumenta oraz Ustawy o świadczeniu usług
                  drogą elektroniczną.
                </p>
                <p>
                  4. Wszelkie spory wynikłe na gruncie Regulaminu i umów
                  sprzedaży będą rozstrzygane przez właściwy sąd powszechny
                  określony według przepisów Kodeksu postępowania cywilnego.
                </p>
                <p>5. Regulamin obowiązuje od dnia 15.10.2023 r.</p>
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
         
          <p>{t("contactInfo.taxId")}</p>
          <p>{t("contactInfo.regon")}</p>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUseContent