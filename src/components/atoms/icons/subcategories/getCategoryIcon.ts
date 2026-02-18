/**
 * Maps category handles to their icon components.
 * 
 * Strategy:
 * 1. Exact handle match first
 * 2. Name-based match for shared categories (e.g. "Biżuteria" appears under Ona and On)
 * 3. Fallback to GenericCategoryIcon
 * 
 * Icons are matched by handle for precision, with name-based grouping
 * for categories that share the same concept across parents.
 */

import type { FC } from "react"
import {
  // Shared / reusable
  BiżuteriaIcon,
  UbraniaIcon,
  UbraniaMęskieIcon,
  DodatkiIcon,
  ZabawkiIcon,
  UbrankaIcon,
  AkcesoriaIcon,
  PozostałeIcon,
  ZestawyPrezentoweIcon,
  GenericCategoryIcon,
  // Nowości
  NowościTygodniaIcon,
  OstatnioIcon,
  NoweKolekcjeIcon,
  RekomendacjeIcon,
  // Ona / On
  TorebkiPlecakiIcon,
  AkcesoriaMęskieIcon,
  DodatkiMęskieIcon,
  // Zwierzęta
  SmyczeIcon,
  SzelkiIcon,
  ObrożeIcon,
  ChustkiIcon,
  ZawieszkiIdIcon,
  MiskiIcon,
  LegowiskaIcon,
  PozostałeZwierzetaIcon,
  // Dom
  DekoracjeIcon,
  TekstyliaDomIcon,
  MebleIcon,
  LampyIcon,
  KuchniaIcon,
  OrganizacjaIcon,
  OgródIcon,
  // Akcesoria
  ModaIcon,
  TechnologiaIcon,
  PapeteriaIcon,
  PodróżeIcon,
  // Prezenty i okazje
  UrodzinyIcon,
  KartkiIcon,
  OpakowaniaIcon,
  ŚlubIcon,
  WalentynkiIcon,
  BożeNarodzenieIcon,
  WielkanocIcon,
  HalloweenIcon,
  DzieńRodzinyIcon,
  ChrzestIcon,
  WieczórPanieńskiIcon,
  WieczórKawalerskiIcon,
  BabyShowerIcon,
  // Vintage
  ModaVintageIcon,
  DomVintageIcon,
  BiżuteriaVintageIcon,
  ZegarkiIcon,
  KolekcjeAntyikiIcon,
  PozostałeVintageIcon,
  // Dziecko
  DekoracjePokojuIcon,
  AkcesoriaDziecięceIcon,
  UbrankaDziecięceIcon,
  ZabawkiDziecięceIcon,
} from "./icons"

interface IconProps {
  className?: string
}

type IconComponent = FC<IconProps>

/**
 * Handle → Icon mapping.
 * Handles are the URL slugs from the database.
 */
const handleToIcon: Record<string, IconComponent> = {
  // ── Nowości ──
  "nowosci-tygodnia": NowościTygodniaIcon,
  "ostatnio-dodane": OstatnioIcon,
  "nowe-kolekcje": NoweKolekcjeIcon,
  "rekomendacje-redakcji": RekomendacjeIcon,

  // ── Ona ──
  "bizuteria": BiżuteriaIcon,
  "ubrania": UbraniaIcon,
  "torebki-i-plecaki": TorebkiPlecakiIcon,
  "dodatki": DodatkiIcon,

  // ── On ──
  "bizuteria-meska": BiżuteriaIcon,       // reuse
  "ubrania-leskie": UbraniaMęskieIcon,     // t-shirt for On
  "dodatki-meskie": DodatkiMęskieIcon,
  "akcesoria-meskie": AkcesoriaMęskieIcon,

  // ── Dziecko ──
  "ubranka": UbrankaDziecięceIcon,
  "zabawki": ZabawkiDziecięceIcon,
  "dekoracje-do-pokoju-dzieciecego": DekoracjePokojuIcon,
  "akcesoria-dzieciece": AkcesoriaDziecięceIcon,

  // ── Zwierzęta ──
  "smycze": SmyczeIcon,
  "szelki": SzelkiIcon,
  "obroze": ObrożeIcon,
  "ubranka-dla-zwierzat": UbrankaIcon,     // reuse
  "chustki-i-bandany": ChustkiIcon,
  "zabawki-dla-zwierzat": ZabawkiIcon,     // reuse
  "zawieszki-i-indentyfikatory": ZawieszkiIdIcon,
  "miski": MiskiIcon,
  "legowiska": LegowiskaIcon,
  "pozostale-zwierzeta": PozostałeZwierzetaIcon,

  // ── Dom ──
  "dekoracje": DekoracjeIcon,
  "tekstylia": TekstyliaDomIcon,
  "meble": MebleIcon,
  "lampy": LampyIcon,
  "kuchnia-i-jadalnia": KuchniaIcon,
  "organizacja": OrganizacjaIcon,
  "ogrod-i-balkon": OgródIcon,

  // ── Akcesoria ──
  "moda": ModaIcon,
  "technologia": TechnologiaIcon,
  "papeteria-i-biuro": PapeteriaIcon,
  "podroze": PodróżeIcon,
  "akcesoria-pozostałe": PozostałeIcon,    // reuse

  // ── Prezenty i okazje ──
  "urodziny": UrodzinyIcon,
  "kartki-okolicznosciowe": KartkiIcon,
  "opakowania": OpakowaniaIcon,
  "slub-i-wesele": ŚlubIcon,
  "rocznice-i-walentynki": WalentynkiIcon,
  "boze-narodzenie": BożeNarodzenieIcon,
  "Wielkanoc": WielkanocIcon,
  "halloween": HalloweenIcon,
  "dzien-matki-ojca-babci-dziadki": DzieńRodzinyIcon,
  "chrzest-i-komunia": ChrzestIcon,
  "wieczor-panienski": WieczórPanieńskiIcon,
  "wieczor-kawalerski": WieczórKawalerskiIcon,
  "baby-shower": BabyShowerIcon,
  "zestawy-prezentowe": ZestawyPrezentoweIcon,
  "dzieci-zestawy-prezentowe": ZestawyPrezentoweIcon, // reuse

  // ── Vintage ──
  "moda-vintage": ModaVintageIcon,
  "dom-vintage": DomVintageIcon,
  "bizuteria-vintage": BiżuteriaVintageIcon,
  "zegarki-vintage": ZegarkiIcon,
  "kolekcje-i-antyki": KolekcjeAntyikiIcon,
  "pozostale-vintage": PozostałeVintageIcon,

  // ── Generic "Pozostałe" handles ──
  "dzieci-pozostale": PozostałeIcon,
  "zabawki-pozostałe": PozostałeIcon,
  "pozostale-dekoracje-dzieciece": PozostałeIcon,
  "pozostale-akcesoria-dzieciece": PozostałeIcon,
  "pozostale-kuchnia": PozostałeIcon,
}

/**
 * Get the icon component for a category by its handle.
 * Returns null if no icon is mapped (allows graceful degradation).
 */
export function getCategoryIcon(handle: string): IconComponent | null {
  return handleToIcon[handle] || null
}

/**
 * Get the icon component for a category, with fallback to generic icon.
 * Use this when you always want an icon to render.
 */
export function getCategoryIconWithFallback(handle: string): IconComponent {
  return handleToIcon[handle] || GenericCategoryIcon
}

export { GenericCategoryIcon }
