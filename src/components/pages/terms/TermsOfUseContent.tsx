"use client"

import React, { useState } from "react"
import { Disclosure } from "@headlessui/react"
import { CollapseIcon } from "@/icons"
import { format } from "date-fns"
import { pl } from "date-fns/locale"

const TermsOfUseContent = () => {
  const [lastUpdated] = useState(new Date(2025, 10, 5))
  const [effectiveDate] = useState(new Date(2025, 10, 5))

  return (
    <div className="terms-content">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-instrument-serif text-3xl md:text-4xl mb-4 font-medium">
          REGULAMIN SERWISU ARTOVNIA
        </h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Data obowiązywania:{" "}
            {format(effectiveDate, "d MMMM yyyy", { locale: pl })}
          </p>
          <p>
            Ostatnia aktualizacja:{" "}
            {format(lastUpdated, "d MMMM yyyy", { locale: pl })}
          </p>
        </div>
      </header>

      {/* Terms Content Sections with Accordion */}
      <div className="space-y-6">
        {/* Section 1 - POSTANOWIENIA OGÓLNE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  1. POSTANOWIENIA OGÓLNE
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
                  1.1. Niniejszy regulamin (dalej &quot;Regulamin&quot;)
                  określa zasady korzystania z internetowej platformy
                  handlowej (dalej &quot;Serwis&quot;), dostępnej pod adresem
                  internetowym www.artovnia.com, prowadzonej przez firmę Ann
                  Sayuri ART Anna Wawrzyniak z siedzibą w ul. Leszczyńskiego
                  4/29, 50-078 Wrocław wpisaną do CEIDG, NIP: 9261642417,
                  REGON: 522385177 (dalej &quot;Administrator&quot;).
                </p>
                <p>
                  1.2. Regulamin określa zasady korzystania z Serwisu przez
                  Użytkowników, w tym Kupujących i Sprzedających, w
                  szczególności zasady zawierania umów sprzedaży, prawa i
                  obowiązki stron, sposoby rozliczeń oraz warunki rozwiązywania
                  umów.
                </p>
                <p>
                  1.3. Każdy Użytkownik, przed rozpoczęciem korzystania z
                  Serwisu, zobowiązany jest do zapoznania się z Regulaminem i
                  jego akceptacji. Korzystanie z Serwisu oznacza akceptację
                  Regulaminu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 2 - DEFINICJE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  2. DEFINICJE
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
                  <li>
                    <strong>SERWIS</strong> – platforma internetowa
                    umożliwiająca Sprzedającym sprzedaż Towarów, a Kupującym
                    ich zakup.
                  </li>
                  <li>
                    <strong>ADMINISTRATOR</strong> – podmiot zarządzający
                    Serwisem.
                  </li>
                  <li>
                    <strong>UŻYTKOWNIK</strong> – każda osoba korzystająca z
                    Serwisu.
                  </li>
                  <li>
                    <strong>ZAREJESTROWANY UŻYTKOWNIK</strong> – Użytkownik,
                    który założył konto w Serwisie.
                  </li>
                  <li>
                    <strong>SPRZEDAJĄCY</strong> – Zarejestrowany Użytkownik,
                    który uzyskał akceptację Administratora na prowadzenie
                    działalności sprzedażowej za pośrednictwem Serwisu.
                  </li>
                  <li>
                    <strong>KUPUJĄCY</strong> – Użytkownik, który zawiera umowę
                    sprzedaży ze Sprzedającym.
                  </li>
                  <li>
                    <strong>KONSUMENT</strong> – osoba fizyczna zawierająca
                    umowę niezwiązaną bezpośrednio z jej działalnością
                    gospodarczą lub zawodową.
                  </li>
                  <li>
                    <strong>PRZEDSIĘBIORCA NA PRAWACH KONSUMENTA</strong> –
                    osoba fizyczna zawierająca umowę bezpośrednio związaną z jej
                    działalnością gospodarczą, która nie ma charakteru
                    zawodowego.
                  </li>
                  <li>
                    <strong>TOWAR</strong> – produkt wystawiony na sprzedaż
                    przez Sprzedającego.
                  </li>
                  <li>
                    <strong>ZAMÓWIENIE</strong> – oświadczenie woli Kupującego
                    zmierzające bezpośrednio do zawarcia umowy sprzedaży z danym
                    Sprzedawcą, składane za pośrednictwem serwisu.
                  </li>
                  <li>
                    <strong>UMOWA SPRZEDAŻY</strong> – umowa zawierana na
                    odległość pomiędzy Kupującym a Sprzedającym, której
                    przedmiotem jest zakup produktu za pośrednictwem platformy
                    www.artovnia.com, zgodnie z ofertą przedstawioną przez
                    Sprzedającego.
                  </li>
                  <li>
                    <strong>KOSZYK</strong> – funkcjonalność serwisu
                    umożliwiająca Kupującemu zapisywanie wybranych produktów
                    przed ich zakupem.
                  </li>
                  <li>
                    <strong>PROWIZJA</strong> – opłata pobierana przez
                    Administratora od Sprzedającego za każdą zakończoną
                    sprzedaż, zgodna z zasadami określonymi w Regulaminie.
                  </li>
                  <li>
                    <strong>RODO</strong> – Rozporządzenie Parlamentu
                    Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016
                    r. dotyczące ochrony danych osobowych i ich swobodnego
                    przepływu.
                  </li>
                  <li>
                    <strong>DNI ROBOCZE</strong> – dni od poniedziałku do
                    piątku z wyłączeniem dni ustawowo wolnych od pracy
                    obowiązujących na terenie Rzeczypospolitej Polskiej.
                  </li>
                  <li>
                    <strong>CZAS REALIZACJI ZAMÓWIENIA</strong> – liczony w
                    dniach roboczych czas, w jakim Sprzedający przygotowuje
                    produkt do wysyłki, liczony od momentu otrzymania informacji
                    o zaksięgowaniu wpłaty.
                  </li>
                  <li>
                    <strong>POLITYKA PRYWATNOŚCI</strong> – dokument odrębny od
                    Regulaminu, określający zasady przetwarzania danych
                    osobowych Użytkowników, dostępny na stronie serwisu.
                  </li>
                  <li>
                    <strong>REGULAMIN</strong> – niniejszy dokument określający
                    zasady korzystania z platformy, prawa i obowiązki
                    Użytkowników oraz Administratora.
                  </li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 3 - WARUNKI TECHNICZNE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  3. WARUNKI TECHNICZNE KORZYSTANIA Z PLATFORMY
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
                  3.1. W celu prawidłowego i pełnego korzystania z
                  funkcjonalności platformy internetowej www.artovnia.com
                  Użytkownik powinien dysponować:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    urządzeniem posiadającym dostęp do Internetu (komputerem,
                    laptopem, smartfonem lub tabletem),
                  </li>
                  <li>
                    aktualną wersją przeglądarki internetowej obsługującej
                    HTML5, JavaScript i pliki cookies (zalecane: Google Chrome,
                    Mozilla Firefox, Safari, Microsoft Edge),
                  </li>
                  <li>
                    aktywnym kontem poczty elektronicznej (e-mail),
                    umożliwiającym odbieranie wiadomości systemowych, powiadomień
                    o zamówieniach, korespondencji od innych użytkowników oraz
                    informacji od Administratora,
                  </li>
                  <li>
                    włączoną obsługą plików cookies w przeglądarce internetowej
                    – niezbędną do prawidłowego działania platformy, logowania i
                    utrzymania sesji użytkownika,
                  </li>
                  <li>
                    programem umożliwiającym otwieranie plików PDF (np. Adobe
                    Acrobat Reader),
                  </li>
                  <li>
                    stabilnym połączeniem internetowym, pozwalającym na ładowanie
                    zdjęć produktów, przeglądanie oferty, składanie zamówień oraz
                    zarządzanie kontem.
                  </li>
                </ul>
                <p>
                  3.2. Administrator dokłada wszelkich starań, aby platforma
                  działała w sposób ciągły, bez błędów i przerw technicznych.
                  Zastrzega jednak możliwość:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    czasowego wyłączenia serwisu lub jego części w celu
                    przeprowadzenia niezbędnych prac konserwacyjnych, aktualizacji
                    lub napraw,
                  </li>
                  <li>
                    wprowadzenia zmian w funkcjonalności platformy, o czym
                    Użytkownicy zostaną powiadomieni z odpowiednim wyprzedzeniem,
                    o ile będzie to możliwe,
                  </li>
                  <li>
                    okresowego ograniczenia dostępu do niektórych funkcji – w
                    szczególności w fazie rozwoju lub testowania nowych rozwiązań.
                  </li>
                </ul>
                <p>3.3. Administrator nie ponosi odpowiedzialności za:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    zakłócenia w działaniu platformy spowodowane nieprawidłowym
                    działaniem sprzętu lub oprogramowania po stronie Użytkownika,
                  </li>
                  <li>
                    czasową niedostępność serwisu wynikającą z przyczyn
                    niezależnych od Administratora (np. awarie serwerów
                    zewnętrznych, ataki DDoS, przerwy u dostawcy hostingu),
                  </li>
                  <li>
                    nieprawidłowe działanie usług, jeśli Użytkownik korzysta z
                    przestarzałej wersji przeglądarki lub wyłączył obsługę plików
                    cookies i/lub JavaScript.
                  </li>
                </ul>
                <p>
                  3.4. W przypadku problemów technicznych, Użytkownik może
                  zgłosić je do Administratora za pośrednictwem formularza
                  kontaktowego dostępnego na stronie lub wysyłając wiadomość
                  e-mail na adres: sayuri.platform@gmail.com
                </p>
                <p>
                  3.5. Administrator zastrzega sobie prawo do ograniczenia lub
                  zablokowania dostępu do konta Użytkownika w przypadku
                  stwierdzenia prób nieautoryzowanego dostępu do serwisu,
                  naruszeń zabezpieczeń lub innych działań zagrażających
                  bezpieczeństwu platformy lub jej Użytkowników.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 4 - REJESTRACJA I KONTO */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  4. REJESTRACJA I KONTO
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
                  4.1. Korzystanie z pełnej funkcjonalności platformy
                  www.artovnia.com w tym możliwość dokonywania zakupów i
                  sprzedaży, wymaga uprzedniej rejestracji i założenia konta
                  użytkownika.
                </p>
                <p>
                  4.2. Rejestracji mogą dokonać osoby fizyczne posiadające pełną
                  zdolność do czynności prawnych, osoby prawne oraz jednostki
                  organizacyjne nieposiadające osobowości prawnej, które mogą
                  nabywać prawa i zaciągać zobowiązania we własnym imieniu.
                </p>
                <p>4.3. Proces rejestracji polega na:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    wypełnieniu formularza rejestracyjnego dostępnego na stronie
                    serwisu,
                  </li>
                  <li>
                    podaniu prawdziwych i aktualnych danych, w tym adresu e-mail,
                    imienia i nazwiska lub nazwy firmy (w przypadku Sprzedających),
                  </li>
                  <li>utworzeniu unikalnego hasła do konta,</li>
                  <li>
                    akceptacji niniejszego Regulaminu oraz Polityki Prywatności,
                  </li>
                  <li>
                    w przypadku Sprzedającego – podaniu dodatkowych informacji
                    potrzebnych do prowadzenia sprzedaży (np. danych do
                    wystawiania faktur, numeru konta bankowego, numeru NIP, REGON
                    jeżeli dotyczy) oraz rejestracja konta u dostawcy płatności
                    Stripe
                  </li>
                </ul>
                <p>4.4. Konto Użytkownika dzieli się na:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Konto Kupującego – umożliwia przeglądanie oferty, dodawanie
                    produktów do koszyka, składanie zamówień oraz komunikację ze
                    Sprzedającym,
                  </li>
                  <li>
                    Konto Sprzedawcy – dodatkowo umożliwia wystawianie ofert
                    sprzedaży, zarządzanie zamówieniami, dostęp do historii
                    sprzedaży i wypłat, edycję danych sklepu.
                  </li>
                </ul>
                <p>
                  4.5. Jeden Użytkownik może posiadać tylko jedno konto, chyba że
                  Administrator wyraził zgodę na utworzenie więcej niż jednego
                  konta z uzasadnionych przyczyn.
                </p>
                <p>4.6. Użytkownik jest zobowiązany do:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    zachowania poufności danych dostępowych do konta (loginu i
                    hasła),
                  </li>
                  <li>nieudostępniania swojego konta osobom trzecim,</li>
                  <li>
                    niepodejmowania działań mogących zakłócić prawidłowe
                    funkcjonowanie platformy,
                  </li>
                  <li>niepodszywania się pod inne osoby lub podmioty.</li>
                </ul>
                <p>
                  4.7. Użytkownik ponosi pełną odpowiedzialność za wszelkie
                  działania wykonane z poziomu jego konta.
                </p>
                <p>
                  4.8. W przypadku podejrzenia, że dane logowania zostały przejęte
                  przez osobę trzecią, Użytkownik zobowiązany jest niezwłocznie
                  poinformować o tym Administratora oraz zmienić hasło.
                </p>
                <p>
                  4.9. Użytkownik może w każdej chwili usunąć swoje konto poprzez
                  złożenie odpowiedniego wniosku do Administratora drogą mailową.
                  Administrator usunie konto w ciągu 14 dni roboczych, pod
                  warunkiem, że na koncie nie toczy się żadne postępowanie (np.
                  reklamacyjne, sporne) i nie istnieją zobowiązania względem
                  innych Użytkowników.
                </p>
                <p>
                  4.10. Usunięcie konta nie wpływa na ważność i skutki prawne
                  transakcji zawartych przed jego usunięciem. Administrator może
                  zachować dane niezbędne do celów rachunkowych, podatkowych lub
                  rozstrzygania ewentualnych roszczeń, zgodnie z Polityką
                  Prywatności i obowiązującymi przepisami prawa.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 5 - ZAWARCIE UMOWY */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  5. ZAWARCIE UMOWY KUPNA-SPRZEDAŻY POMIĘDZY KUPUJĄCYM A
                  SPRZEDAJĄCYM
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
                  5.1. Zawarcie umowy kupna-sprzedaży następuje bezpośrednio
                  pomiędzy Kupującym a Sprzedającym, z chwilą skutecznego
                  złożenia zamówienia przez Kupującego i jego potwierdzenia przez
                  system platformy po zaksięgowaniu płatności.
                </p>
                <p>
                  5.2. Złożenie zamówienia odbywa się poprzez funkcjonalność
                  platformy i wymaga:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>wyboru produktu,</li>
                  <li>uzupełnienia danych niezbędnych do dostawy,</li>
                  <li>wyboru metody płatności,</li>
                  <li>akceptacji Regulaminu,</li>
                  <li>
                    kliknięcia przycisku finalizującego zakup (np. &quot;Kupuję i
                    płacę&quot;).
                  </li>
                </ul>
                <p>
                  5.3. Kupujący jest związany ofertą w momencie złożenia
                  zamówienia. Potwierdzenie przyjęcia zamówienia do realizacji
                  następuje automatycznie drogą mailową oraz w panelu użytkownika.
                </p>
                <p>
                  5.4. Umowa zawierana jest na odległość, zgodnie z przepisami
                  ustawy z dnia 30 maja 2014 r. o prawach konsumenta, jeżeli
                  Kupujący jest Konsumentem lub Przedsiębiorcą na prawach
                  konsumenta.
                </p>
                <p>
                  5.5. Administrator nie jest stroną umowy kupna-sprzedaży.
                  Odpowiedzialność za realizację umowy, w tym:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>wysyłkę produktu,</li>
                  <li>jego zgodność z opisem,</li>
                  <li>wystawienie rachunku lub faktury,</li>
                  <li>rozpatrywanie reklamacji i zwrotów</li>
                </ul>
                <p>spoczywa wyłącznie na Sprzedającym.</p>
                <p>
                  5.6. Sprzedający zobowiązany jest do zrealizowania zamówienia w
                  terminie wskazanym w ofercie lub – w razie jego braku – nie
                  później niż w terminie 5 dni roboczych od daty zaksięgowania
                  płatności.
                </p>
                <p>
                  5.7. W przypadku, gdy realizacja zamówienia okaże się niemożliwa
                  (np. brak towaru, błąd w ofercie), Sprzedający ma obowiązek
                  niezwłocznie poinformować o tym Kupującego oraz Administratora.
                  W takiej sytuacji Kupujący ma prawo do pełnego zwrotu wpłaconej
                  kwoty, a umowę uznaje się za niezawartą.
                </p>
                <p>
                  5.8. Wszelkie zmiany w zamówieniu po jego złożeniu (np. zmiana
                  adresu dostawy, danych kontaktowych) mogą być wprowadzane
                  wyłącznie za zgodą Sprzedającego i za pośrednictwem platformy
                  lub bezpośredniego kontaktu Kupującego ze Sprzedającym.
                </p>
                <p>
                  5.9. Administrator zapewnia techniczną możliwość kontaktu
                  pomiędzy stronami transakcji poprzez system wiadomości w serwisie
                  lub przesyłanie powiadomień e-mailowych.
                </p>
                <p>
                  5.10. W przypadku nieporozumień pomiędzy Kupującym a
                  Sprzedającym, każda ze stron może zwrócić się do Administratora z
                  prośbą o mediację. Administrator nie rozstrzyga sporów, ale może
                  ułatwić komunikację i dążyć do polubownego rozwiązania problemu.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 6 - SPRZEDAŻ I ROZLICZENIA */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  6. SPRZEDAŻ I ROZLICZENIA
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
                  6.1. Sprzedający może wystawiać swoje produkty do sprzedaży na
                  platformie po aktywacji konta Sprzedawcy i wypełnieniu
                  niezbędnych danych wymaganych do rozliczeń.
                </p>
                <p>
                  6.2. Wszystkie ceny produktów podawane w serwisie muszą być
                  cenami brutto, zawierającymi obowiązujące podatki i opłaty.
                  Koszty dostawy muszą być wskazane osobno, w sposób jednoznaczny i
                  widoczny dla Kupującego przed złożeniem zamówienia.
                </p>
                <p>
                  6.3. Umowa sprzedaży zawierana jest pomiędzy Sprzedającym a
                  Kupującym. Administrator udostępnia jedynie infrastrukturę
                  techniczną umożliwiającą prezentację oferty i zawarcie
                  transakcji.
                </p>
                <p>
                  6.4. Po dokonaniu zakupu przez Kupującego oraz zaksięgowaniu
                  płatności, system automatycznie przypisuje zamówienie do
                  odpowiedniego Sprzedającego. Informacja o nowym zamówieniu
                  pojawia się w panelu Sprzedawcy.
                </p>
                <p>
                  6.5. Środki należne Sprzedającemu z tytułu zrealizowanych
                  zamówień są rozliczane w cyklu miesięcznym. Rozliczenie środków
                  następuje do 8 dnia kolejnego miesiąca kalendarzowego, obejmując
                  wszystkie zamówienia oznaczone jako zrealizowane do ostatniego
                  dnia miesiąca poprzedniego.
                </p>
                <p>
                  6.6. Kwota do wypłaty stanowi sumę wartości zamówień
                  zrealizowanych pomniejszoną o prowizję serwisu, która wynosi 20%
                  + VAT wartości brutto sprzedanych produktów (zgodnie z cennikiem
                  obowiązującym w dniu sprzedaży).
                </p>
                <p>
                  6.7. Wypłaty realizowane są za pośrednictwem serwisu PayU na
                  numer konta wskazany przez Sprzedającego w ustawieniach konta.
                  Sprzedający zobowiązany jest do utrzymywania aktualnych danych
                  rozliczeniowych. Administrator nie ponosi odpowiedzialności za
                  opóźnienia wynikające z błędnie podanych danych.
                </p>
                <p>
                  6.8. Administrator zastrzega sobie prawo do wstrzymania wypłaty
                  środków w przypadku:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    wystąpienia sporów lub reklamacji dotyczących zrealizowanych
                    zamówień,
                  </li>
                  <li>
                    podejrzenia naruszenia postanowień Regulaminu,
                  </li>
                  <li>
                    konieczności weryfikacji danych Sprzedającego lub dokonania
                    korekty rozliczenia.
                  </li>
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 7 - PRAWA I OBOWIĄZKI SPRZEDAJĄCEGO */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  7. PRAWA I OBOWIĄZKI SPRZEDAJĄCEGO
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
                  7.1. Sprzedający ma prawo korzystać z serwisu www.artovnia.com w
                  celu prezentowania i sprzedaży własnych produktów zgodnie z
                  postanowieniami Regulaminu.
                </p>
                <p>7.2. Sprzedający zobowiązuje się do:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    oferowania wyłącznie produktów, do których posiada pełne prawa
                    do sprzedaży – w szczególności praw własności lub licencji,
                  </li>
                  <li>
                    wystawiania w serwisie jedynie produktów wykonanych
                    samodzielnie, zaprojektowanych osobiście lub tworzonych w ramach
                    autorskiej działalności artystycznej lub rzemieślniczej,
                  </li>
                  <li>
                    każdorazowego opatrzenia wystawianego produktu co najmniej
                    jednym zdjęciem przedstawiającym realny wygląd oferowanego
                    przedmiotu,
                  </li>
                  <li>
                    zamieszczania dokładnego, rzetelnego, niewprowadzającego w błąd
                    opisu każdego produktu, obejmującego m.in. materiał, wymiary,
                    kolor, sposób użytkowania, przeznaczenie, ewentualne ograniczenia
                    lub wady,
                  </li>
                  <li>
                    ustalania cen brutto (zawierających podatek VAT, jeżeli dotyczy)
                    oraz kosztów dostawy,
                  </li>
                  <li>
                    realizowania zamówień zgodnie z terminem określonym w opisie
                    produktu lub nie dłużej niż 5 dni roboczych od otrzymania
                    powiadomienia o wpłacie od Administratora, o ile opis nie
                    wskazuje inaczej,
                  </li>
                  <li>
                    starannego pakowania i wysyłania produktów w sposób zapewniający
                    ich bezpieczne dostarczenie,
                  </li>
                  <li>
                    informowania Kupującego o ewentualnych opóźnieniach lub
                    problemach z realizacją zamówienia,
                  </li>
                  <li>
                    prowadzenia komunikacji z Kupującym wyłącznie za pośrednictwem
                    narzędzi komunikacyjnych dostępnych na platformie,
                  </li>
                  <li>
                    niepromowania sprzedaży poza platformą – w szczególności
                    zakazany jest kontakt z Kupującym w celach marketingowych,
                    dołączanie do przesyłek ulotek, wizytówek, adresów stron
                    internetowych, mediów społecznościowych, numerów telefonów i
                    adresów e-mail,
                  </li>
                  <li>
                    nieoferowania tego samego produktu poza serwisem po niższej
                    cenie, jeśli nie został on oznaczony jako objęty promocją lub
                    wyprzedażą
                  </li>
                  <li>
                    nieumieszczania treści naruszających obowiązujące przepisy prawa,
                    dobrych obyczajów, praw osób trzecich ani zasad współżycia
                    społecznego,
                  </li>
                  <li>
                    nieprzetwarzania danych osobowych Kupujących w żadnych celach
                    innych niż realizacja zamówienia (np. w celach marketingowych).
                  </li>
                </ul>
                <p>
                  7.3. Sprzedający ponosi pełną odpowiedzialność za wszelkie błędy,
                  nieścisłości, naruszenia prawa, a także za skutki wynikające z
                  niewłaściwego opisu lub nienależytego wykonania zamówienia.
                </p>
                <p>
                  7.4. Sprzedający zobowiązuje się do udzielania rzetelnych i
                  zgodnych z prawem informacji dotyczących reklamacji i zwrotów oraz
                  do rozpatrywania reklamacji Kupujących zgodnie z obowiązującymi
                  przepisami (w tym ustawą o prawach konsumenta).
                </p>
                <p>
                  7.5. Sprzedający, który jest przedsiębiorcą, ma obowiązek
                  przestrzegania przepisów dotyczących rękojmi, prawa do odstąpienia
                  od umowy zawartej na odległość oraz informowania o swoich danych
                  identyfikujących (firma, NIP, adres prowadzenia działalności
                  itp.).
                </p>
                <p>
                  7.6. Sprzedający jest zobowiązany do przestrzegania przepisów o
                  ochronie danych osobowych (RODO) i zapewnienia, że dane Kupujących
                  nie są przekazywane ani udostępniane osobom trzecim, z wyjątkiem
                  przypadków przewidzianych prawem lub niezbędnych do realizacji
                  zamówienia.
                </p>
                <p>
                  7.7. Sprzedający może edytować swoje oferty, dodawać nowe
                  produkty, aktualizować dane kontaktowe, status urlopowy oraz inne
                  informacje w swoim panelu sprzedawcy. Sprzedający zobowiązany jest
                  do utrzymywania aktualnych informacji na koncie.
                </p>
                <p>
                  7.8. Sprzedający ma obowiązek poinformować Administratora o
                  planowanym urlopie, przerwie w realizacji zamówień lub czasowej
                  niedostępności produktów. W takim przypadku zobowiązany jest do
                  aktywacji statusu urlopowego w panelu administracyjnym konta.
                </p>
                <p>
                  7.9. Sprzedający przyjmuje do wiadomości, że prowizja serwisu
                  wynosi 20% od ceny brutto produktu + obowiązujący podatek VAT.
                  Prowizja ta jest pobierana automatycznie przez Administratora z
                  kwoty wpłaconej przez Kupującego. Prowizja jest liczona wyłącznie
                  od ceny produktu i nie obejmuje ceny wysyłki.
                </p>
                <p>
                  7.10. Sprzedający zobowiązuje się do zachowania standardów
                  estetycznych i jakościowych obowiązujących w serwisie.
                  Administrator zastrzega sobie prawo do odrzucenia lub usunięcia
                  oferty niespełniającej wymogów estetycznych, zgodności z tematyką
                  serwisu lub zasad uczciwego handlu.
                </p>
                <p>
                  7.11. Administrator ma prawo do monitorowania aktywności
                  Sprzedającego w serwisie, w tym komunikacji z Kupującymi, w celu
                  zapewnienia przestrzegania Regulaminu.
                </p>
                <p>
                  7.12. W przypadku podejrzenia naruszenia przepisów prawa, dobrych
                  obyczajów lub niniejszego Regulaminu, Administrator zastrzega sobie
                  prawo do czasowego lub trwałego zawieszenia konta Sprzedającego
                  oraz usunięcia jego oferty.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 8 - ZAWIESZENIE KONTA SPRZEDAJĄCEGO */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  8. ZAWIESZENIE KONTA SPRZEDAJĄCEGO
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
                  8.1. Administrator ma prawo zawiesić konto Sprzedającego w
                  przypadku naruszenia przez niego postanowień niniejszego
                  Regulaminu, obowiązującego prawa lub dobrych obyczajów, w
                  szczególności gdy:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Sprzedający nie realizuje zamówień w terminie określonym w
                    opisie produktu lub w Regulaminie,
                  </li>
                  <li>
                    otrzymuje znaczną liczbę negatywnych opinii od Kupujących,
                  </li>
                  <li>
                    wystawia do sprzedaży towary niezgodne z opisem, nieoryginalne,
                    podrobione lub nielegalne,
                  </li>
                  <li>promuje sprzedaż poza platformą,</li>
                  <li>
                    kontaktuje się z Kupującym z pominięciem narzędzi komunikacyjnych
                    udostępnionych przez platformę,
                  </li>
                  <li>
                    narusza prawa autorskie, prawa własności intelektualnej lub dobra
                    osobiste osób trzecich,
                  </li>
                  <li>
                    nie przestrzega przepisów dotyczących ochrony danych osobowych, w
                    szczególności RODO,
                  </li>
                  <li>
                    podejmuje próby obejścia systemu prowizyjnego obowiązującego w
                    serwisie.
                  </li>
                </ul>
                <p>
                  8.2. Zawieszenie konta oznacza czasowe ograniczenie dostępu do
                  panelu Sprzedającego, możliwości wystawiania nowych produktów oraz
                  realizacji zamówień do momentu wyjaśnienia sprawy.
                </p>
                <p>
                  8.3. Przed zawieszeniem konta, Administrator może wysłać
                  Sprzedającemu upomnienie drogą mailową, informując o konieczności
                  zaprzestania naruszeń w terminie wskazanym w wiadomości.
                </p>
                <p>
                  8.4. Jeżeli po upomnieniu naruszenia nie ustają lub sytuacja się
                  powtarza, Administrator może bez dalszego ostrzeżenia:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>zawiesić konto Sprzedającego na czas nieokreślony,</li>
                  <li>trwale usunąć konto Sprzedającego,</li>
                  <li>
                    zablokować wypłaty z tytułu sprzedaży do czasu wyjaśnienia
                    sytuacji,
                  </li>
                  <li>
                    ograniczyć widoczność oferty Sprzedającego na stronie głównej, w
                    wyszukiwarce lub w wynikach filtrów.
                  </li>
                </ul>
                <p>
                  8.5. W przypadku zawieszenia lub usunięcia konta, Sprzedający
                  zachowuje obowiązek realizacji już przyjętych zamówień zgodnie z
                  warunkami sprzedaży, chyba że Administrator postanowi inaczej ze
                  względu na charakter naruszenia.
                </p>
                <p>
                  8.6. Sprzedający może odwołać się od decyzji o zawieszeniu konta,
                  przesyłając uzasadnienie drogą mailową na adres kontaktowy
                  Administratora. Administrator zobowiązuje się do rozpatrzenia
                  odwołania w terminie 14 dni roboczych.
                </p>
                <p>
                  8.7. Administrator zastrzega sobie prawo do odmowy ponownej
                  rejestracji konta przez Sprzedającego, którego konto zostało
                  wcześniej usunięte z powodu rażącego naruszenia Regulaminu.
                </p>
                <p>
                  8.8. Sprzedający, którego konto zostało zawieszone lub usunięte,
                  nie ma prawa tworzyć nowych kont bez uprzedniej pisemnej zgody
                  Administratora. W przypadku wykrycia takiego działania, nowe konto
                  zostanie automatycznie usunięte
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 9 - ODPOWIEDZIALNOŚĆ */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  9. ODPOWIEDZIALNOŚĆ
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
                  9.1. Administrator zapewnia techniczne funkcjonowanie platformy,
                  umożliwiające zawieranie umów sprzedaży pomiędzy Użytkownikami,
                  jednak nie jest stroną tych umów. Odpowiedzialność za realizację
                  transakcji, zgodność oferty z opisem oraz jakość i legalność
                  sprzedawanych produktów spoczywa wyłącznie na Sprzedających.
                </p>
                <p>9.2. Administrator nie ponosi odpowiedzialności za:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    niewykonanie lub nienależyte wykonanie umowy sprzedaży zawartej
                    pomiędzy Sprzedającym a Kupującym,
                  </li>
                  <li>
                    prawdziwość, rzetelność i kompletność informacji zamieszczonych
                    przez Sprzedających w opisach produktów,
                  </li>
                  <li>
                    zgodność sprzedawanych produktów z przepisami prawa (w tym z
                    przepisami o ochronie konsumentów, prawie autorskim, znakach
                    towarowych, przepisach celnych, sanitarnych itp.),
                  </li>
                  <li>
                    szkody wynikłe z błędnego korzystania z serwisu przez Użytkownika
                    lub z braku możliwości jego użycia z przyczyn niezależnych od
                    Administratora,
                  </li>
                  <li>
                    jakość, bezpieczeństwo, legalność ani pochodzenie oferowanych
                    produktów,
                  </li>
                  <li>
                    działania lub zaniechania Sprzedających, w tym opóźnienia w
                    wysyłce, błędy w realizacji zamówień, brak odpowiedzi na
                    reklamację czy też nieprzestrzeganie obowiązków informacyjnych.
                  </li>
                </ul>
                <p>9.3. Administrator zastrzega sobie prawo do:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    usunięcia ofert naruszających przepisy prawa, Regulamin, dobre
                    obyczaje lub godzących w wizerunek platformy,
                  </li>
                  <li>
                    zawieszenia lub usunięcia konta Użytkownika, który swoim
                    działaniem zagraża bezpieczeństwu serwisu, łamie prawo lub działa
                    na szkodę innych Użytkowników,
                  </li>
                  <li>
                    edycji lub ograniczenia widoczności ofert w przypadku podejrzenia
                    nieuczciwego działania,
                  </li>
                  <li>
                    blokady wypłat środków w przypadku konieczności wyjaśnienia
                    naruszenia zasad Regulaminu.
                  </li>
                </ul>
                <p>
                  9.4. Sprzedający ponosi pełną odpowiedzialność za wszelkie skutki
                  prawne wynikające z wystawienia do sprzedaży produktu, który:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>jest nielegalny,</li>
                  <li>
                    narusza prawa autorskie, prawa własności intelektualnej lub dobra
                    osobiste osób trzecich,
                  </li>
                  <li>
                    został opisany w sposób nieprawdziwy lub wprowadzający w błąd,
                  </li>
                  <li>
                    jest niezgodny z obowiązującymi przepisami sanitarnymi,
                    konsumenckimi lub bezpieczeństwa produktów.
                  </li>
                </ul>
                <p>
                  9.5. W przypadku, gdy osoba trzecia, organ administracji publicznej
                  lub inny podmiot skieruje wobec Administratora roszczenia lub
                  żądania wynikające z działań Sprzedającego (np. w związku z
                  naruszeniem praw autorskich, niewywiązaniem się z umowy,
                  niewłaściwym przetwarzaniem danych), Sprzedający zobowiązuje się
                  zwolnić Administratora z odpowiedzialności i pokryć wszelkie
                  związane z tym koszty (w tym koszty obsługi prawnej).
                </p>
                <p>
                  9.6. Administrator nie gwarantuje nieprzerwanego i wolnego od
                  błędów działania serwisu. Może wystąpić tymczasowy brak dostępu do
                  platformy w wyniku awarii, modernizacji, konserwacji lub innych
                  przyczyn technicznych niezależnych od Administratora.
                </p>
                <p>
                  9.7. Administrator podejmuje wszelkie możliwe działania, aby
                  zapewnić bezpieczeństwo działania serwisu, w tym ochronę danych,
                  jednak nie ponosi odpowiedzialności za skutki działań osób trzecich
                  (np. włamań, kradzieży danych), jeżeli dołożył należytej
                  staranności w zakresie zabezpieczeń.
                </p>
                <p>
                  9.8. Użytkownik korzysta z platformy na własną odpowiedzialność.
                  Jest zobowiązany do przestrzegania obowiązującego prawa oraz
                  postanowień Regulaminu i ponosi pełną odpowiedzialność za swoje
                  działania w serwisie.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 10 - ZWROTY I REKLAMACJE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  10. ZWROTY I REKLAMACJE
                </h2>
                <CollapseIcon
                  size={18}
                  className={`${
                    open ? "transform rotate-180" : ""
                  } text-gray-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="pt-4 text-gray-700 space-y-3">
                <h3 className="font-medium text-base">
                  10.1. Prawo odstąpienia od umowy zawartej na odległość (zakup od
                  Sprzedającego - Przedsiębiorcy)
                </h3>
                <p>
                  10.1.1. Zgodnie z ustawą z dnia 30 maja 2014 r. o prawach
                  konsumenta, Kupujący będący Konsumentem lub Przedsiębiorcą na
                  prawach konsumenta ma prawo odstąpić od umowy sprzedaży zawartej
                  na odległość bez podania przyczyny w terminie 14 dni od dnia
                  otrzymania produktu.
                </p>
                <p>
                  10.1.2. Aby skorzystać z prawa odstąpienia od umowy, Kupujący
                  powinien złożyć jednoznaczne oświadczenie o odstąpieniu od umowy.
                  Może to nastąpić np. drogą mailową na adres Sprzedającego lub za
                  pośrednictwem funkcji dostępnych w serwisie.
                </p>
                <p>
                  10.1.3. Kupujący powinien odesłać produkt w terminie 14 dni od
                  dnia złożenia oświadczenia o odstąpieniu od umowy. Koszt przesyłki
                  zwrotnej ponosi Kupujący, chyba że Sprzedający zobowiązał się go
                  pokryć.
                </p>
                <p>
                  10.1.4. Zwrot środków przez Sprzedającego powinien nastąpić nie
                  później niż w ciągu 14 dni od momentu otrzymania oświadczenia o
                  odstąpieniu od umowy, z zastrzeżeniem, że Sprzedający może
                  wstrzymać się ze zwrotem do czasu otrzymania towaru lub dowodu jego
                  odesłania.
                </p>
                <p>
                  10.1.5. W przypadku wyboru przez Kupującego droższej niż najtańsza
                  oferowana przez Sprzedającego formy dostawy, Sprzedający nie jest
                  zobowiązany do zwrotu kosztów przewyższających koszt najtańszej
                  dostępnej metody dostawy.
                </p>
                <p>
                  10.1.6. Konsument ponosi odpowiedzialność za zmniejszenie wartości
                  produktu wynikające z korzystania z niego w sposób wykraczający
                  poza konieczny do stwierdzenia jego charakteru, cech i
                  funkcjonowania.
                </p>
                <p>
                  10.1.7. Zwrot towaru nie jest możliwy w przypadku przedmiotów:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    wykonanych na indywidualne zamówienie (np. personalizowanych),
                  </li>
                  <li>
                    noszących znamiona użytkowania, które wykluczają ich ponowną
                    sprzedaż,
                  </li>
                  <li>
                    których charakter wyklucza możliwość zwrotu zgodnie z ustawą o
                    prawach konsumenta.
                  </li>
                </ul>

                <h3 className="font-medium text-base pt-4">
                  10.2. Reklamacje (brak zgodności towaru z umową)
                </h3>
                <p>
                  10.2.1. Sprzedający będący przedsiębiorcą ponosi odpowiedzialność
                  wobec Konsumenta oraz Przedsiębiorcy na prawach konsumenta za
                  zgodność towaru z umową zgodnie z rozdziałem 5a ustawy o prawach
                  konsumenta.
                </p>
                <p>
                  10.2.2. W przypadku stwierdzenia, że towar jest niezgodny z umową,
                  Kupujący powinien niezwłocznie skontaktować się ze Sprzedającym w
                  celu złożenia reklamacji.
                </p>
                <p>10.2.3. Reklamacja powinna zawierać:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>imię i nazwisko Kupującego,</li>
                  <li>datę zawarcia umowy i datę otrzymania towaru,</li>
                  <li>opis niezgodności towaru z umową,</li>
                  <li>
                    żądanie Kupującego (wymiana, naprawa, obniżenie ceny, odstąpienie
                    od umowy),
                  </li>
                  <li>
                    dokument potwierdzający zakup (np. numer zamówienia, potwierdzenie
                    płatności).
                  </li>
                </ul>
                <p>
                  10.2.4. Sprzedający zobowiązany jest do ustosunkowania się do
                  reklamacji w terminie 14 dni kalendarzowych od dnia jej otrzymania.
                  Brak odpowiedzi w tym terminie oznacza uznanie reklamacji za
                  uzasadnioną.
                </p>
                <p>10.2.5. Kupujący może żądać:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>naprawy lub wymiany towaru na wolny od wad,</li>
                  <li>
                    obniżenia ceny lub odstąpienia od umowy, jeśli:
                    <ul className="list-disc ml-5 space-y-1 mt-1">
                      <li>
                        naprawa lub wymiana są niemożliwe lub wymagają nadmiernych
                        kosztów,
                      </li>
                      <li>
                        Sprzedający nie usunął wady w rozsądnym czasie,
                      </li>
                      <li>wada występuje mimo prób jej usunięcia,</li>
                      <li>
                        wada jest na tyle istotna, że uzasadnia natychmiastowe
                        odstąpienie od umowy.
                      </li>
                    </ul>
                  </li>
                </ul>
                <p>
                  10.2.6. Sprzedający odpowiada za brak zgodności towaru z umową,
                  który ujawnił się w ciągu 2 lat od dostarczenia towaru.
                </p>
                <p>
                  10.2.7. Jeżeli Kupujący nie otrzyma odpowiedzi w terminie 14 dni
                  lub Sprzedający odmówi uznania reklamacji, Kupujący może zgłosić
                  sprawę Administratorowi celem mediacji.
                </p>

                <h3 className="font-medium text-base pt-4">
                  10.3. Rola Administratora w procesie reklamacyjnym
                </h3>
                <p>
                  10.3.1. Administrator nie jest stroną umowy sprzedaży, ale może
                  pośredniczyć w kontakcie między Kupującym a Sprzedającym w celu
                  wyjaśnienia sprawy i usprawnienia procesu reklamacyjnego.
                </p>
                <p>
                  10.3.2. W przypadku braku polubownego rozwiązania sporu, Kupujący
                  ma prawo skierować sprawę do odpowiedniego organu ochrony
                  konsumentów lub sądu powszechnego.
                </p>
                <p>
                  10.3.3. Kupujący może skorzystać z pozasądowych metod rozpatrywania
                  sporów, m.in. za pośrednictwem platformy ODR Komisji Europejskiej (
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                  ).
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 11 - OPINIE KUPUJĄCYCH */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  11. OPINIE KUPUJĄCYCH
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
                  11.1. Po zrealizowaniu zamówienia Kupujący ma możliwość
                  wystawienia opinii dotyczącej zakupionego produktu oraz jakości
                  obsługi Sprzedającego.
                </p>
                <p>
                  11.2. Opinie powinny być zgodne z rzeczywistym przebiegiem
                  transakcji i zawierać informacje rzetelne, konkretne oraz
                  kulturalne. Kupujący zobowiązany jest do powstrzymania się od
                  treści obraźliwych, wulgarnych, niezgodnych z prawem lub
                  naruszających dobra osobiste.
                </p>
                <p>11.3. Wystawiona opinia może zawierać:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    ocenę w formie punktowej lub gwiazdek (jeśli taka funkcja jest
                    dostępna),
                  </li>
                  <li>krótki opis słowny,</li>
                  <li>
                    ewentualne sugestie lub uwagi dotyczące produktu lub obsługi.
                  </li>
                </ul>
                <p>
                  11.4. Opinie są publikowane na stronie produktu lub profilu
                  Sprzedającego i są widoczne dla innych Użytkowników.
                </p>
                <p>
                  11.5. Administrator zastrzega sobie prawo do moderowania, ukrycia
                  lub usunięcia opinii w przypadku, gdy:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    opinia zawiera treści wulgarne, obraźliwe, dyskryminujące lub
                    naruszające prawo,
                  </li>
                  <li>
                    zawiera dane osobowe, dane kontaktowe, linki zewnętrzne lub
                    materiały reklamowe,
                  </li>
                  <li>
                    została wystawiona w sposób nierzetelny, nie dotyczy konkretnej
                    transakcji lub budzi uzasadnione podejrzenie, że została napisana
                    w złej wierze (np. przez konkurencję),
                  </li>
                  <li>
                    występuje uzasadnione podejrzenie, że Kupujący próbuje wymusić
                    określone działanie (np. rabat, darmową wysyłkę lub zwrot środków)
                    pod groźbą wystawienia negatywnej opinii.
                  </li>
                </ul>
                <p>
                  11.5a. W przypadku próby szantażu lub innego nadużycia związanego z
                  wystawioną opinią, Sprzedający ma prawo zgłosić sprawę do
                  Administratora za pośrednictwem formularza kontaktowego lub
                  wiadomości e-mail. Zgłoszenie powinno zawierać:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>numer zamówienia,</li>
                  <li>treść opinii (jeśli już została wystawiona),</li>
                  <li>uzasadnienie podejrzenia nadużycia,</li>
                  <li>
                    ewentualną dokumentację (np. zrzuty ekranu z korespondencji).
                  </li>
                </ul>
                <p>
                  Administrator każdorazowo rozpatruje zgłoszenie indywidualnie, w
                  ciągu maksymalnie 14 dni roboczych, i może podjąć decyzję o
                  ukryciu, usunięciu lub pozostawieniu opinii.
                </p>
                <p>
                  11.6. Sprzedający ma prawo odpowiedzieć na otrzymaną opinię, co
                  umożliwia wyjaśnienie sytuacji lub podziękowanie za pozytywną
                  ocenę. Komentarz Sprzedającego również musi być zgodny z zasadami
                  kultury wypowiedzi.
                </p>
                <p>
                  11.7. Administrator nie ingeruje w treść opinii, o ile nie narusza
                  ona zasad określonych w Regulaminie. Opinie nie są redagowane ani
                  cenzurowane, poza sytuacjami opisanymi powyżej.
                </p>
                <p>
                  11.8. Opinie Kupujących stanowią ważny element oceny Sprzedającego
                  przez innych Użytkowników i mogą mieć wpływ na jego pozycję w
                  serwisie, udział w promocjach lub widoczność ofert.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 12 - DANE OSOBOWE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  12. DANE OSOBOWE KUPUJĄCYCH I SPRZEDAJĄCYCH
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
                  12.1. Administratorem danych osobowych użytkowników korzystających
                  z serwisu (zarówno Kupujących, jak i Sprzedających) jest
                  właściciel platformy – firma Ann Sayuri ART Anna Wawrzyniak, z
                  siedzibą w ul. Leszczyńskiego 4/29, 50-078 Wrocław, działająca
                  zgodnie z obowiązującym prawem, w szczególności z Rozporządzeniem
                  Parlamentu Europejskiego i Rady (UE) 2016/679 (tzw. RODO).
                </p>
                <p>12.2. Dane osobowe Użytkowników przetwarzane są w celu:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>umożliwienia korzystania z funkcjonalności platformy,</li>
                  <li>realizacji transakcji sprzedaży,</li>
                  <li>prowadzenia konta użytkownika,</li>
                  <li>
                    kontaktu w sprawach związanych z obsługą zamówień,
                  </li>
                  <li>
                    realizacji obowiązków prawnych Administratora (np. księgowych,
                    podatkowych),
                  </li>
                  <li>rozpatrywania reklamacji,</li>
                  <li>
                    prowadzenia działań marketingowych, za zgodą użytkownika.
                  </li>
                </ul>
                <p>
                  12.3. Podanie danych osobowych jest dobrowolne, ale niezbędne do
                  założenia konta, złożenia zamówienia, wystawienia oferty lub
                  korzystania z innych funkcji platformy.
                </p>
                <p>
                  12.4. Dane osobowe mogą być udostępniane innym Użytkownikom
                  wyłącznie w zakresie niezbędnym do realizacji zamówienia (np.
                  przekazanie danych adresowych Sprzedającemu w celu nadania
                  przesyłki).
                </p>
                <p>
                  12.5. Każdy Użytkownik ma prawo wglądu do swoich danych, ich
                  poprawiania, ograniczenia przetwarzania, przenoszenia, wniesienia
                  sprzeciwu wobec przetwarzania, a także ich usunięcia – w
                  przypadkach przewidzianych prawem.
                </p>
                <p>
                  12.6. Wszelkie szczegóły dotyczące przetwarzania danych osobowych,
                  celów, podstaw prawnych, odbiorców danych, czasu ich przechowywania
                  oraz przysługujących praw znajdują się w odrębnym dokumencie:
                  Polityka Prywatności, dostępnym na stronie serwisu.
                </p>
                <p>
                  12.7. Użytkownik, który przekazuje dane osobowe (np. Kupujący
                  przesyłający dane do dostawy), zobowiązany jest do ich podawania
                  zgodnie z prawdą. Sprzedający zobowiązany jest do korzystania z
                  tych danych wyłącznie w celu realizacji danego zamówienia –
                  zabronione jest ich wykorzystywanie w celach marketingowych lub
                  przekazywanie osobom trzecim bez zgody Kupującego.
                </p>
                <p>
                  12.8. Administrator dokłada wszelkich starań, aby dane były
                  chronione przed nieuprawnionym dostępem, utratą, uszkodzeniem lub
                  zniszczeniem – m.in. przez stosowanie odpowiednich środków
                  technicznych i organizacyjnych.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 13 - KODY RABATOWE, PROMOCJE, WYPRZEDAŻE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  13. KODY RABATOWE, PROMOCJE, WYPRZEDAŻE
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
                  13.1. Platforma może okresowo organizować akcje promocyjne,
                  wyprzedaże oraz udostępniać kody rabatowe, które umożliwiają
                  Kupującym skorzystanie z obniżonej ceny produktu lub darmowej
                  dostawy.
                </p>
                <p>13.2. Kody rabatowe mogą być:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    ogólnodostępne – udostępnione publicznie w serwisie lub w mediach
                    społecznościowych,
                  </li>
                  <li>
                    indywidualne – przypisane do konkretnego Użytkownika (np. jako
                    nagroda w konkursie, element programu lojalnościowego,
                    rekompensata itp.),
                  </li>
                  <li>
                    ograniczone czasowo, ilościowo lub możliwe do wykorzystania tylko
                    przy określonych warunkach (np. minimalna kwota zamówienia,
                    wybrane kategorie produktów).
                  </li>
                </ul>
                <p>
                  13.3. Szczegółowe zasady obowiązywania danego kodu rabatowego lub
                  promocji określa informacja towarzysząca danej akcji – m.in. czas
                  trwania, warunki skorzystania, ograniczenia oraz lista produktów
                  objętych promocją.
                </p>
                <p>
                  13.4. Sprzedający ma możliwość samodzielnego tworzenia i
                  udostępniania kodów rabatowych na swoje produkty za pośrednictwem
                  panelu konta, jeśli funkcja ta została przez Administratora
                  włączona. Sprzedający ponosi pełną odpowiedzialność za warunki i
                  realizację takiej promocji.
                </p>
                <p>
                  13.5. Produkty objęte promocją lub wyprzedażą powinny być
                  odpowiednio oznaczone w ofercie – z widoczną ceną przed i po
                  obniżce. Zabronione jest sztuczne zawyżanie cen przed promocją, co
                  może skutkować zablokowaniem oferty lub konta.
                </p>
                <p>
                  13.6. Kody rabatowe nie podlegają wymianie na gotówkę, nie są
                  dziedziczne ani przenoszalne (chyba że wyraźnie zaznaczono
                  inaczej), a ich niewykorzystanie w terminie skutkuje ich
                  wygaśnięciem.
                </p>
                <p>
                  13.7. Administrator zastrzega sobie prawo do zakończenia lub zmiany
                  warunków danej promocji w dowolnym momencie, jeżeli przemawiają za
                  tym ważne przyczyny, takie jak błędy systemowe, nadużycia, zmiany
                  techniczne lub decyzje strategiczne.
                </p>
                <p>
                  13.8. W przypadku wątpliwości co do zasad działania promocji lub
                  błędnego naliczenia rabatu, Kupujący może skontaktować się z
                  Administratorem, który dołoży starań, by rozwiązać problem w sposób
                  zgodny z interesem Użytkownika i Regulaminem.
                </p>
                <p>
                  13.9. Udział Sprzedających w akcjach promocyjnych organizowanych
                  przez platformę lub Administratora ma charakter całkowicie
                  dobrowolny. Sprzedający może samodzielnie zdecydować o przystąpieniu
                  do danej promocji oraz wybrać, które produkty zostaną nią objęte.
                  Brak udziału w promocji nie wpływa na dostępność pozostałych funkcji
                  platformy.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 14 - WYKORZYSTANIE TREŚCI SPRZEDAJĄCYCH */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  14. WYKORZYSTANIE TREŚCI SPRZEDAJĄCYCH W DZIAŁANIACH
                  MARKETINGOWYCH
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
                  14.1. Sprzedający, publikując oferty w serwisie, wyraża zgodę na
                  nieodpłatne wykorzystanie przez Administratora:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>zdjęć produktów,</li>
                  <li>opisów produktów,</li>
                  <li>nazwy sklepu,</li>
                  <li>
                    imienia i nazwiska lub nazwy firmy (jeśli są publicznie widoczne
                    na koncie Sprzedawcy),
                  </li>
                  <li>
                    ogólnych informacji o Sprzedawcy i jego ofercie,
                  </li>
                </ul>
                <p>
                  na potrzeby działań marketingowych i promocyjnych prowadzonych
                  przez Administratora.
                </p>
                <p>
                  14.2. Działania marketingowe mają na celu zwiększenie widoczności
                  platformy, wsparcie sprzedaży, promowanie oferty Sprzedających oraz
                  budowanie rozpoznawalności serwisu i marek sprzedających.
                </p>
                <p>
                  14.3. Treści Sprzedających mogą być wykorzystywane w szczególności
                  w następujących kanałach:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    media społecznościowe: Instagram, Facebook, TikTok, Pinterest,
                  </li>
                  <li>
                    sieć reklamowa Google (w tym reklamy graficzne i tekstowe),
                  </li>
                  <li>
                    blog Artovni oraz inne formy publikacji redakcyjnych (np. artykuły
                    z poleceniami produktów),
                  </li>
                  <li>
                    płatne kampanie reklamowe prowadzone w imieniu platformy,
                  </li>
                  <li>
                    newsletter i inne formy komunikacji z użytkownikami.
                  </li>
                </ul>
                <p>
                  14.4. Administrator może – w celu ochrony materiałów graficznych i
                  podkreślenia źródła pochodzenia – dodawać znak wodny do
                  udostępnianych zdjęć produktów.
                </p>
                <p>
                  14.5. Wykorzystanie treści Sprzedającego nie narusza jego praw
                  autorskich – Sprzedający pozostaje właścicielem wszelkich praw do
                  publikowanych materiałów. Zgoda na ich użycie ma charakter
                  niewyłączny i obejmuje jedynie działania promujące serwis oraz
                  ofertę Sprzedających.
                </p>
                <p>
                  14.6. W przypadku chęci cofnięcia zgody na wykorzystanie konkretnych
                  materiałów, Sprzedający może skontaktować się z Administratorem.
                  Administrator zastrzega sobie prawo do pozostawienia materiałów w
                  dotychczasowych publikacjach (np. w archiwalnych postach lub
                  artykułach), ale nie będzie ich ponownie wykorzystywał w nowych
                  kampaniach.
                </p>
                <p>
                  14.7. Wszelkie treści Sprzedającego (w szczególności zdjęcia, opisy,
                  nazwa sklepu i informacje o Sprzedającym) mogą być wykorzystywane
                  przez Administratora wyłącznie tak długo, jak długo Sprzedający
                  posiada aktywne konto w serwisie. Po usunięciu konta materiały nie
                  będą ponownie wykorzystywane w nowych działaniach marketingowych.
                  Administrator zastrzega sobie jednak prawo do pozostawienia już
                  istniejących treści, w których dane Sprzedającego zostały wcześniej
                  użyte – dotyczy to w szczególności opublikowanych artykułów, postów
                  w mediach społecznościowych, archiwalnych kampanii reklamowych oraz
                  wpisów blogowych.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 15 - PRZETWARZANIE PŁATNOŚCI I INTEGRACJA ZE STRIPE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans uppercase">
                  15. Przetwarzanie płatności i integracja ze Stripe
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
                  15.1. Obsługa płatności na platformie realizowana jest za
                  pośrednictwem zewnętrznego operatora płatności – firmy Stripe
                  (Stripe Payments Europe, Ltd. lub Stripe, Inc.), z którą
                  Administrator posiada zawartą umowę współpracy.
                </p>
                <p>
                  15.2. Stripe zapewnia bezpieczne przetwarzanie transakcji i spełnia
                  najwyższe standardy w zakresie ochrony danych oraz zgodności z
                  przepisami prawa, w tym z RODO, dyrektywą PSD2 i wymogami PCI DSS.
                </p>
                <p>15.3 Dostępne metody płatności w serwisie to:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    przelew bankowy (natychmiastowy – poprzez zintegrowany system
                    płatności),
                  </li>
                  <li>płatność BLIK,</li>
                  <li>
                    płatność kartą płatniczą lub kredytową (Visa, Mastercard, American
                    Express).
                  </li>
                </ul>
                <p>
                  15.4. Wszystkie transakcje są przetwarzane w czasie rzeczywistym, a
                  dane dotyczące płatności są szyfrowane i przesyłane bezpiecznym
                  połączeniem SSL. Administrator nie przetwarza ani nie przechowuje
                  żadnych danych dotyczących kart płatniczych Kupujących.
                </p>
                <p>
                  15.5. W przypadku problemów z płatnością lub braku jej
                  zaksięgowania, Kupujący powinien w pierwszej kolejności sprawdzić,
                  czy transakcja została poprawnie zakończona w systemie bankowym, a
                  następnie może skontaktować się z Administratorem lub bezpośrednio z
                  obsługą Stripe.
                </p>
                <p>
                  15.6. W celu sprzedaży produktów oraz otrzymywania wypłat środków,
                  każdy Sprzedający zobowiązany jest do założenia konta Stripe i jego
                  połączenia z kontem Sprzedawcy na platformie.
                </p>
                <p>
                  15.7. Proces rejestracji konta Stripe odbywa się poprzez dedykowany
                  formularz dostępny w panelu Sprzedawcy. Rejestracja konta Stripe
                  jest bezpłatna i stanowi warunek konieczny do korzystania z funkcji
                  sprzedażowych oraz otrzymywania płatności.
                </p>
                <p>
                  15.8. Dane podane przez Sprzedającego w procesie rejestracji konta
                  Stripe są przetwarzane i przechowywane wyłącznie przez Stripe,
                  zgodnie z ich własnym regulaminem i polityką prywatności.
                  Administrator platformy nie ma dostępu do pełnych danych finansowych
                  ani dokumentów przesyłanych do Stripe.
                </p>
                <p>
                  15.9. Stripe odpowiada za bezpieczeństwo wszystkich transakcji, w
                  tym: przetwarzanie płatności, weryfikację tożsamości Sprzedawcy,
                  przeciwdziałanie oszustwom i spełnianie wymogów przepisów dotyczących
                  przeciwdziałania praniu pieniędzy (AML) oraz finansowania terroryzmu.
                </p>
                <p>
                  15.10. Środki uzyskane ze sprzedaży produktów są przechowywane na
                  koncie Stripe Sprzedawcy i wypłacane zgodnie z harmonogramem
                  określonym w Regulaminie, tj. raz w miesiącu do 8 dnia miesiąca
                  następującego po miesiącu sprzedaży (z zastrzeżeniem ewentualnych
                  opóźnień wynikających z procedur Stripe lub sytuacji wyjątkowych
                  opisanych w niniejszym Regulaminie).
                </p>
                <p>
                  15.11. Administrator pobiera prowizję od sprzedaży bezpośrednio z
                  kwoty transakcji przetwarzanej przez Stripe, zgodnie z aktualnie
                  obowiązującym cennikiem i zasadami rozliczeń. Sprzedający otrzymuje
                  kwotę pomniejszoną o należną prowizję.
                </p>
                <p>
                  15.12. Sprzedający nie ponosi żadnych dodatkowych opłat z tytułu
                  korzystania z Stripe poza prowizją naliczaną przez platformę. Stripe
                  może jednak – zgodnie z własnym regulaminem – naliczyć opłaty w
                  szczególnych przypadkach (np. przy zwrotach środków, opłatach
                  chargeback itp.).
                </p>
                <p>
                  15.13. Sprzedający zobowiązany jest do zapewnienia, że jego konto
                  Stripe pozostaje aktywne i prawidłowo skonfigurowane przez cały
                  okres korzystania z platformy. W przypadku zawieszenia, dezaktywacji
                  lub błędnej konfiguracji konta Stripe, wypłata środków może zostać
                  czasowo wstrzymana.
                </p>
                <p>
                  15.14. Administrator nie ponosi odpowiedzialności za działania
                  Stripe, w tym za czas przetwarzania wypłat, ewentualne opóźnienia,
                  odmowy rejestracji konta Stripe, weryfikację tożsamości, jak również
                  za kwestie związane z błędnie podanymi danymi bankowymi po stronie
                  Sprzedającego.
                </p>
                <p>
                  15.15. W przypadku jakichkolwiek pytań lub problemów związanych z
                  kontem Stripe, Sprzedający powinien w pierwszej kolejności
                  skontaktować się bezpośrednio z zespołem wsparcia Stripe.
                </p>
                <p>
                  15.16. Administrator zastrzega sobie prawo do zmiany operatora
                  płatności, pod warunkiem zapewnienia Sprzedającym odpowiedniego czasu
                  na dostosowanie się do nowych warunków i zapewnienia ciągłości
                  wypłat.
                </p>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Section 16 - POSTANOWIENIA KOŃCOWE */}
        <Disclosure as="div" className="border-b border-gray-200 pb-6">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between items-center text-left">
                <h2 className="text-xl font-medium font-instrument-sans">
                  16. POSTANOWIENIA KOŃCOWE
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
                  16.1. Administrator zastrzega sobie prawo do zmiany Regulaminu.
                  Użytkownicy zostaną powiadomieni o zmianie z co najmniej 15-dniowym
                  wyprzedzeniem.
                </p>
                <p>
                  16.2. W sprawach nieuregulowanych zastosowanie mają przepisy prawa
                  polskiego.
                </p>
                <p>
                  16.3. Spory rozstrzygane będą przez sąd właściwy dla siedziby
                  Administratora, z zastrzeżeniem, że wobec Konsumentów właściwość sądu
                  określają przepisy Kodeksu postępowania cywilnego.
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
          <p>ul. Leszczyńskiego 4/29, 50-078 Wrocław</p>
          <p>Email: sayuri.platform@gmail.com</p>
          <p>NIP: 9261642417</p>
          <p>REGON: 522385177</p>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUseContent