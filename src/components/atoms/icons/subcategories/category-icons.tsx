/**
 * Complete SVG Icon Set for ALL Child Categories
 * Style: outline only, sketch-like, no fill, no color — just strokes
 * Color: currentColor (inherits from parent)
 * Stroke: 1.5px, round caps/joins
 * 
 * Icons are keyed by category NAME (not handle) for reuse across
 * parents that share the same child name (e.g. "Biżuteria" in Ona & On).
 */

import React from "react"

interface IconProps {
  className?: string
}

// ─────────────────────────────────────────────
// SHARED / REUSABLE ICONS
// (used by multiple parent categories)
// ─────────────────────────────────────────────

/** Biżuteria — necklace with pendant (Ona, On, Vintage) */
export const BiżuteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3C8 3 6 5 5 7.5C4 10 4 12 5 13" />
    <path d="M16 3C16 3 18 5 19 7.5C20 10 20 12 19 13" />
    <circle cx="12" cy="16" r="4" />
    <path d="M12 12V8" />
    <circle cx="12" cy="16" r="1.5" />
  </svg>
)

/** Ubrania — dress silhouette (Ona, On, Vintage) */
export const UbraniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3L7 7L5 8V11L7 10V21H17V10L19 11V8L17 7L15 3" />
    <path d="M9 3C9 3 10 5 12 5C14 5 15 3 15 3" />
  </svg>
)

/** Dodatki — scarf draped (Ona, On) */
export const DodatkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6C6 6 8 4 12 4C16 4 18 6 18 6" />
    <path d="M6 6L5 10L7 11L6 16L8 18" />
    <path d="M18 6L19 10L17 11L18 16L16 18" />
    <path d="M8 18C8 18 10 20 12 20C14 20 16 18 16 18" />
  </svg>
)

/** Zabawki — teddy bear (Dziecko, Zwierzęta) */
export const ZabawkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="5" />
    <circle cx="8" cy="7" r="2.5" />
    <circle cx="16" cy="7" r="2.5" />
    <circle cx="10.5" cy="12" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="12" r="0.5" fill="currentColor" stroke="none" />
    <path d="M11 14.5C11 14.5 11.5 15.5 12 15.5C12.5 15.5 13 14.5 13 14.5" />
  </svg>
)

/** Ubranka — small onesie (Dziecko, Zwierzęta) */
export const UbrankaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4L7 6L5 7V10L7 9V18C7 19 8 20 9 20H15C16 20 17 19 17 18V9L19 10V7L17 6L15 4" />
    <path d="M9 4C9 4 10 6 12 6C14 6 15 4 15 4" />
    <path d="M10 11H14" />
  </svg>
)

/** Akcesoria — bag + keychain (On, Akcesoria) */
export const AkcesoriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="9" width="14" height="11" rx="2" />
    <path d="M9 9V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V9" />
    <circle cx="12" cy="15" r="1.5" />
  </svg>
)

/** Pozostałe — grid of dots (generic fallback) */
export const PozostałeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="1.5" />
    <circle cx="12" cy="7" r="1.5" />
    <circle cx="17" cy="7" r="1.5" />
    <circle cx="7" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="17" cy="12" r="1.5" />
    <circle cx="7" cy="17" r="1.5" />
    <circle cx="12" cy="17" r="1.5" />
    <circle cx="17" cy="17" r="1.5" />
  </svg>
)

/** Zestawy prezentowe — gift box */
export const ZestawyPrezentoweIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="1" />
    <rect x="5" y="7" width="14" height="3" rx="1" />
    <path d="M12 7V21" />
    <path d="M8 7C8 7 8 4 10 3C12 4 12 7 12 7" />
    <path d="M16 7C16 7 16 4 14 3C12 4 12 7 12 7" />
  </svg>
)

// ─────────────────────────────────────────────
// NOWOŚCI (New arrivals)
// ─────────────────────────────────────────────

/** Nowości tygodnia — calendar with star */
export const NowościTygodniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9H20" />
    <path d="M8 3V5" />
    <path d="M16 3V5" />
    <path d="M12 13L13 15.5L15.5 15.5L13.75 17L14.5 19.5L12 18L9.5 19.5L10.25 17L8.5 15.5L11 15.5Z" />
  </svg>
)

/** Ostatnio dodane — clock with plus */
export const OstatnioIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7V12L15 14" />
    <path d="M19 3L21 5" />
  </svg>
)

/** Nowe kolekcje — sparkle / collection */
export const NoweKolekcjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L13.5 8.5L20 7L15 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9 12L4 7L10.5 8.5Z" />
  </svg>
)

/** Rekomendacje redakcji — thumbs up / badge */
export const RekomendacjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22V11L3 11V22H7Z" />
    <path d="M7 11L10 3C10 3 11 2 12.5 2C14 2 14 3.5 14 4V8H19C20.1 8 21 9 20.8 10.1L19.5 20.1C19.3 21.2 18.4 22 17.3 22H7" />
  </svg>
)

// ─────────────────────────────────────────────
// ONA (Her) — Torebki i plecaki
// ─────────────────────────────────────────────

/** Torebki i plecaki — handbag */
export const TorebkiPlecakiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10V19C6 20 7 21 8 21H16C17 21 18 20 18 19V10" />
    <path d="M4 10H20L19 8H5L4 10Z" />
    <path d="M9 8C9 5.5 10 3 12 3C14 3 15 5.5 15 8" />
    <path d="M10 14H14" />
  </svg>
)

// ─────────────────────────────────────────────
// ZWIERZĘTA (Pets)
// ─────────────────────────────────────────────

/** Smycze — leash */
export const SmyczeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="5" r="2" />
    <path d="M7 7V10" />
    <path d="M7 10C7 10 7 14 10 16C13 18 17 18 17 18" />
    <path d="M17 18V21" />
    <path d="M15 21H19" />
  </svg>
)

/** Szelki — harness */
export const SzelkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="7" ry="5" />
    <path d="M8 8L6 5" />
    <path d="M16 8L18 5" />
    <path d="M12 7V17" />
    <path d="M8 12H16" />
  </svg>
)

/** Obroże — collar ring */
export const ObrożeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="8" ry="4" />
    <ellipse cx="12" cy="12" rx="8" ry="4" transform="rotate(0)" />
    <circle cx="12" cy="16" r="1.5" />
    <path d="M12 17.5V20" />
    <circle cx="12" cy="20.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Chustki i bandany */
export const ChustkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4L20 4L12 20Z" />
    <path d="M8 4C8 4 9 8 12 8C15 8 16 4 16 4" />
  </svg>
)

/** Zawieszki i identyfikatory — tag */
export const ZawieszkiIdIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L20 7V13L12 22L4 13V7L12 2Z" />
    <circle cx="12" cy="8" r="2" />
  </svg>
)

/** Miski — pet bowl */
export const MiskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12C3 12 4 18 12 18C20 18 21 12 21 12" />
    <path d="M3 12H21" />
    <path d="M7 18V20" />
    <path d="M17 18V20" />
    <path d="M6 20H18" />
  </svg>
)

/** Legowiska — pet bed */
export const LegowiskaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16C3 16 3 10 7 10C9 10 10 12 12 12C14 12 15 10 17 10C21 10 21 16 21 16" />
    <path d="M2 16H22" />
    <path d="M4 16V19" />
    <path d="M20 16V19" />
  </svg>
)

// ─────────────────────────────────────────────
// DOM (Home)
// ─────────────────────────────────────────────

/** Dekoracje — picture frame */
export const DekoracjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <rect x="6" y="7" width="12" height="10" rx="0.5" />
    <path d="M6 14L10 10L13 13L16 10L18 12" />
  </svg>
)

/** Tekstylia — fabric/cushion */
export const TekstyliaDomIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10C3 10 7 8 12 8C17 8 21 10 21 10" />
    <path d="M8 12L10 14L12 12L14 14L16 12" />
  </svg>
)

/** Meble — chair */
export const MebleIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 10V4C6 3 7 2 8 2H16C17 2 18 3 18 4V10" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <path d="M6 14V20" />
    <path d="M18 14V20" />
    <path d="M6 17H18" />
  </svg>
)

/** Lampy — desk lamp */
export const LampyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3H15L18 12H6L9 3Z" />
    <path d="M12 12V18" />
    <path d="M8 18H16" />
    <path d="M12 3V1" />
    <path d="M6 12L4 14" />
    <path d="M18 12L20 14" />
  </svg>
)

/** Kuchnia i jadalnia — cup/mug */
export const KuchniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8V17C5 19 7 20 9 20H13C15 20 17 19 17 17V8" />
    <path d="M5 8H17" />
    <path d="M17 10H19C20 10 21 11 21 12C21 13 20 14 19 14H17" />
    <path d="M9 5C9 4 10 3 11 4" />
    <path d="M13 4C13 3 14 2 15 3" />
  </svg>
)

/** Organizacja — box/container */
export const OrganizacjaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M3 8L5 4H19L21 8" />
    <path d="M10 8V12H14V8" />
  </svg>
)

/** Ogród i balkon — potted plant */
export const OgródIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 15H16L15 21H9L8 15Z" />
    <path d="M12 15V10" />
    <path d="M12 10C12 10 8 9 7 5C10 6 12 8 12 10" />
    <path d="M12 10C12 10 16 9 17 5C14 6 12 8 12 10" />
    <path d="M12 8C12 8 11 4 12 2C13 4 12 8 12 8" />
  </svg>
)

// ─────────────────────────────────────────────
// AKCESORIA (Accessories)
// ─────────────────────────────────────────────

/** Moda — sunglasses */
export const ModaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="13" r="3.5" />
    <circle cx="16.5" cy="13" r="3.5" />
    <path d="M11 13H13" />
    <path d="M4 13L2 10" />
    <path d="M20 13L22 10" />
  </svg>
)

/** Technologia — phone/device */
export const TechnologiaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18H13" />
    <path d="M7 5H17" />
    <path d="M7 16H17" />
  </svg>
)

/** Papeteria i biuro — notebook/pen */
export const PapeteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="3" width="12" height="18" rx="1" />
    <path d="M8 3V21" />
    <path d="M11 8H14" />
    <path d="M11 11H14" />
    <path d="M11 14H13" />
    <path d="M19 3L21 17L20 18L18 4Z" />
  </svg>
)

/** Podróże — compass */
export const PodróżeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M16 8L14 14L8 16L10 10L16 8Z" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

// ─────────────────────────────────────────────
// PREZENTY I OKAZJE (Gifts & Occasions)
// ─────────────────────────────────────────────

/** Urodziny — birthday cake */
export const UrodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="12" width="16" height="9" rx="2" />
    <path d="M4 15H20" />
    <path d="M8 12V10" />
    <path d="M12 12V9" />
    <path d="M16 12V10" />
    <path d="M8 8C8 7 8 6 8 6" />
    <path d="M12 7C12 6 12 5 12 5" />
    <path d="M16 8C16 7 16 6 16 6" />
  </svg>
)

/** Kartki okolicznościowe — greeting card */
export const KartkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M4 4L12 12" />
    <path d="M12 12L20 4" />
    <path d="M8 14H16" />
    <path d="M10 17H14" />
  </svg>
)

/** Opakowania — wrapping/box */
export const OpakowaniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M12 8V21" />
    <path d="M3 8H21" />
    <path d="M8 8C8 8 8 4 10 3C12 4 12 8 12 8" />
    <path d="M16 8C16 8 16 4 14 3C12 4 12 8 12 8" />
  </svg>
)

/** Ślub i wesele — wedding rings */
export const ŚlubIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="13" r="5" />
    <circle cx="15" cy="13" r="5" />
    <path d="M12 4L10 8" />
    <path d="M12 4L14 8" />
    <path d="M12 4L12 2" />
  </svg>
)

/** Rocznice i walentynki — heart */
export const WalentynkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C12 21 3 14 3 8.5C3 5.5 5.5 3 8 3C9.5 3 11 4 12 5.5C13 4 14.5 3 16 3C18.5 3 21 5.5 21 8.5C21 14 12 21 12 21Z" />
  </svg>
)

/** Boże Narodzenie — christmas tree */
export const BożeNarodzenie: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L8 8H10L6 14H9L5 20H19L15 14H18L14 8H16L12 2Z" />
    <path d="M11 20V22" />
    <path d="M13 20V22" />
  </svg>
)

/** Wielkanoc — easter egg */
export const WielkanocIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="13" rx="6" ry="8" />
    <path d="M6.5 11C6.5 11 9 9 12 9C15 9 17.5 11 17.5 11" />
    <path d="M6.5 15C6.5 15 9 13 12 13C15 13 17.5 15 17.5 15" />
  </svg>
)

/** Halloween — pumpkin */
export const HalloweenIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C7 21 3 17 3 13C3 9 7 5 12 5C17 5 21 9 21 13C21 17 17 21 12 21Z" />
    <path d="M12 5C12 5 11 2 12 1C13 2 12 5 12 5" />
    <path d="M12 5V21" />
    <path d="M9 11V13" />
    <path d="M15 11V13" />
    <path d="M9 16C9 16 10.5 18 12 18C13.5 18 15 16 15 16" />
  </svg>
)

/** Dzień Matki / Ojca / Babci / Dziadka — family heart */
export const DzieńRodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18C12 18 5 13 5 9C5 7 7 5 9 5C10.2 5 11.2 5.8 12 6.8C12.8 5.8 13.8 5 15 5C17 5 19 7 19 9C19 13 12 18 12 18Z" />
    <circle cx="8" cy="21" r="1.5" />
    <circle cx="12" cy="21" r="1.5" />
    <circle cx="16" cy="21" r="1.5" />
  </svg>
)

/** Chrzest i komunia — cross with dove */
export const ChrzestIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3V21" />
    <path d="M7 8H17" />
    <path d="M4 5C4 5 6 3 8 4C6 5 4 5 4 5" />
    <path d="M4 5L6 6" />
  </svg>
)

/** Wieczór Panieński — high heel */
export const WieczórPanieńskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18L6 10C6 10 7 6 10 6C12 6 13 8 14 10C15 12 16 14 20 14" />
    <path d="M20 14V18" />
    <path d="M4 18H20" />
    <path d="M4 18V20" />
    <path d="M20 18V20" />
  </svg>
)

/** Wieczór Kawalerski — bow tie */
export const WieczórKawalerskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8L10 12L4 16V8Z" />
    <path d="M20 8L14 12L20 16V8Z" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
  </svg>
)

/** Baby Shower — baby bottle */
export const BabyShowerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="8" height="13" rx="3" />
    <path d="M10 8V5C10 4 10.5 3 12 3C13.5 3 14 4 14 5V8" />
    <path d="M10 3H14" />
    <path d="M8 13H16" />
  </svg>
)

// ─────────────────────────────────────────────
// VINTAGE
// ─────────────────────────────────────────────

/** Moda vintage — vintage dress form */
export const ModaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4C8 4 9 2 12 2C15 2 16 4 16 4" />
    <path d="M8 4C7 6 6 10 6 12C6 14 8 16 8 16" />
    <path d="M16 4C17 6 18 10 18 12C18 14 16 16 16 16" />
    <path d="M8 16H16" />
    <path d="M12 16V19" />
    <path d="M9 19H15" />
    <path d="M10 19V21" />
    <path d="M14 19V21" />
  </svg>
)

/** Dom vintage — antique vase */
export const DomVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4H15" />
    <path d="M10 4C10 4 8 8 8 12C8 16 10 20 10 20" />
    <path d="M14 4C14 4 16 8 16 12C16 16 14 20 14 20" />
    <path d="M10 20H14" />
    <path d="M9 10H15" />
  </svg>
)

/** Biżuteria vintage — vintage brooch */
export const BiżuteriaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="6" ry="7" />
    <ellipse cx="12" cy="12" rx="3" ry="4" />
    <path d="M12 5V2" />
    <path d="M6 9L3 7" />
    <path d="M18 9L21 7" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

/** Zegarki — vintage watch */
export const ZegarkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="5" />
    <path d="M12 9V12L14 13.5" />
    <path d="M12 5V3" />
    <path d="M12 21V19" />
    <path d="M10 3H14" />
    <path d="M10 21H14" />
  </svg>
)

/** Kolekcje i antyki — treasure chest */
export const KolekcjeAntyikiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="10" rx="1" />
    <path d="M3 10C3 10 3 5 12 5C21 5 21 10 21 10" />
    <path d="M10 13H14V16H10V13Z" />
    <path d="M12 10V13" />
  </svg>
)

// ─────────────────────────────────────────────
// DZIECKO extras
// ─────────────────────────────────────────────

/** Dekoracje do pokoju dziecięcego — mobile/stars */
export const DekoracjePokojuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3H18" />
    <path d="M12 3V6" />
    <path d="M8 3V8" />
    <path d="M16 3V8" />
    <path d="M12 6L11 8.5L8.5 8.5L10.5 10L9.5 12.5L12 11L14.5 12.5L13.5 10L15.5 8.5L13 8.5Z" />
    <circle cx="8" cy="10" r="2" />
    <circle cx="16" cy="10" r="2" />
    <path d="M8 12V15" />
    <path d="M16 12V14" />
  </svg>
)

/** Akcesoria dziecięce — baby bib */
export const AkcesoriaDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="6" r="3" />
    <path d="M9 8C7 9 5 12 5 15C5 18 8 20 12 20C16 20 19 18 19 15C19 12 17 9 15 8" />
    <circle cx="12" cy="14" r="2" />
  </svg>
)

// ─────────────────────────────────────────────
// GENERIC FALLBACK
// ─────────────────────────────────────────────

export const GenericCategoryIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2V5" />
    <path d="M12 19V22" />
    <path d="M2 12H5" />
    <path d="M19 12H22" />
    <path d="M4.93 4.93L7.05 7.05" />
    <path d="M16.95 16.95L19.07 19.07" />
    <path d="M4.93 19.07L7.05 16.95" />
    <path d="M16.95 7.05L19.07 4.93" />
  </svg>
)
