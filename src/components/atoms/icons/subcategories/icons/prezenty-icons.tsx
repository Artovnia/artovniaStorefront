/**
 * PREZENTY I OKAZJE (Gifts & Occasions) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Urodziny — birthday cake with candles and frosting */
export const UrodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cake base */}
    <path d="M4 15C4 13 6 12 12 12C18 12 20 13 20 15V18C20 19 19 20 18 20H6C5 20 4 19 4 18V15Z" />

    {/* Frosting wave */}
    <path d="M4 15C6 13.8 8 14.8 10 15C12 15.2 14 14 16 15C18 16 20 14.8 20 14.8" />

    {/* Candles */}
    <path d="M9 12V9" />
    <path d="M12 12V8.5" />
    <path d="M15 12V9" />

    {/* Soft flame shape */}
    <path d="M12 7C12 7 11 6 12 5C13 6 12 7 12 7Z" />
  </svg>
)


/** Kartki okolicznościowe — open greeting card with heart */
export const KartkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Open card silhouette */}
    <path d="M3 6C3 6 6 5 12 7C18 9 21 8 21 8V18C21 18 18 19 12 17C6 15 3 16 3 16V6Z" />

    {/* Center fold */}
    <path d="M12 7V17" />

    {/* Soft heart */}
    <path d="M12 12C12 12 10.5 10.5 9.5 11.5C8.5 12.5 10 14 12 15C14 14 15.5 12.5 14.5 11.5C13.5 10.5 12 12 12 12Z" />
  </svg>
)


/** Opakowania — gift wrapping with ribbon and bow */
export const OpakowaniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Box */}
    <path d="M4 11H20V19C20 20 19 21 18 21H6C5 21 4 20 4 19V11Z" />

    {/* Ribbon vertical */}
    <path d="M12 11V21" />

    {/* Bow — soft curves */}
    <path d="M12 11C12 11 9 9 8 7.5C7 6 8.5 5 10 6C11 6.8 12 8 12 8" />
    <path d="M12 11C12 11 15 9 16 7.5C17 6 15.5 5 14 6C13 6.8 12 8 12 8" />
  </svg>
)


/** Ślub i wesele — bride in wedding dress and groom in suit */
export const ŚlubIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Bride — left side */}
    {/* Head */}
    <circle cx="8" cy="3.5" r="2" />
    {/* Veil */}
    <path d="M6 2.5C6 2.5 5 1.5 5 1" />
    <path d="M6 3C6 3 4.5 2.5 4 2" />
    <path d="M6 4C6 4 4 4 3.5 3.5" />
    {/* Body / dress top */}
    <path d="M6.5 5.5L5 8" />
    <path d="M9.5 5.5L11 8" />
    {/* Wedding dress — flowing A-line */}
    <path d="M5 8C5 8 3 14 2 20" />
    <path d="M11 8C11 8 13 14 14 20" />
    <path d="M2 20C2 20 5 19 8 19C11 19 14 20 14 20" />
    {/* Dress waist detail */}
    <path d="M5.5 10H10.5" />
    {/* Bouquet */}
    <circle cx="8" cy="12" r="1.5" />
    <path d="M8 13.5V15" />

    {/* Groom — right side */}
    {/* Head */}
    <circle cx="18" cy="3.5" r="2" />
    {/* Suit jacket */}
    <path d="M16.5 5.5L15 8V20" />
    <path d="M19.5 5.5L21 8V20" />
    {/* Suit lapels */}
    <path d="M16.5 5.5L18 8" />
    <path d="M19.5 5.5L18 8" />
    {/* Tie */}
    <path d="M18 5.5V9" />
    <path d="M17.5 6L18 6.5L18.5 6" />
    {/* Pants */}
    <path d="M15 20L16 14" />
    <path d="M21 20L20 14" />
    <path d="M18 8V14" />
  </svg>
)

/** Rocznice i walentynki — ornate heart with flourishes */
export const WalentynkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21C12 21 3 14 3 8.5C3 5.5 5.5 3 8 3C9.5 3 11 4 12 5.5C13 4 14.5 3 16 3C18.5 3 21 5.5 21 8.5C21 14 12 21 12 21Z" />
    <path d="M12 5.5C12 5.5 10 8 10 10C10 12 12 13 12 13C12 13 14 12 14 10C14 8 12 5.5 12 5.5Z" />
    <path d="M8 8L6 7" />
    <path d="M16 8L18 7" />
  </svg>
)

/** Boże Narodzenie — christmas tree with ornaments and star */
export const BożeNarodzenieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1L10.5 3.5L12 3L9 8H11L7 13H10L5 19H19L14 13H17L13 8H15L12 3L13.5 3.5L12 1Z" />
    <path d="M11 19V22" />
    <path d="M13 19V22" />
    <path d="M10 22H14" />
    <circle cx="10" cy="11" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="14" cy="15" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="11" cy="16" r="0.7" fill="currentColor" stroke="none" />
  </svg>
)

/** Wielkanoc — decorated easter egg with patterns */
export const WielkanocIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="13" rx="6" ry="8" />
    <path d="M6.5 10C6.5 10 9 8.5 12 8.5C15 8.5 17.5 10 17.5 10" />
    <path d="M6.5 15C6.5 15 9 13.5 12 13.5C15 13.5 17.5 15 17.5 15" />
    <path d="M8 12L9 11.5L10 12.5L11 11.5L12 12.5L13 11.5L14 12.5L15 11.5L16 12" />
    <circle cx="10" cy="17" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="14" cy="17" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Halloween — carved jack-o-lantern with squashed pumpkin shape */
export const HalloweenIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Pumpkin body — wide squashed shape, not a circle */}
    <path d="M12 5C8 5 5 6.5 3.5 9C2.5 11 2.5 13.5 3.5 15.5C5 18 8 19.5 12 19.5C16 19.5 19 18 20.5 15.5C21.5 13.5 21.5 11 20.5 9C19 6.5 16 5 12 5Z" />
    {/* Left lobe bulge */}
    <path d="M5 6.5C5 6.5 3 8 2.5 10.5C2 13 3 16 5 18" />
    {/* Right lobe bulge */}
    <path d="M19 6.5C19 6.5 21 8 21.5 10.5C22 13 21 16 19 18" />
    {/* Center rib */}
    <path d="M12 5.5C12 5.5 11 8 11 12C11 16 12 19 12 19" />
    <path d="M12 5.5C12 5.5 13 8 13 12C13 16 12 19 12 19" />
    {/* Stem — thick and curved */}
    <path d="M10.5 5.5C10.5 5.5 10.5 3.5 11.5 2.5C12.5 2 13.5 3 13.5 5" />
    {/* Curly vine */}
    <path d="M13 3C14 2 15.5 2 16.5 2.5" />
    {/* Left eye — angular carved triangle */}
    <path d="M7 9.5L9 8L10 10.5L7 9.5Z" />
    {/* Right eye — angular carved triangle */}
    <path d="M17 9.5L15 8L14 10.5L17 9.5Z" />
    {/* Nose — small triangle */}
    <path d="M11 12L12 10.5L13 12Z" />
    {/* Mouth — wide carved grin with teeth */}
    <path d="M7 14.5C7 14.5 8 16.5 9.5 16.5C10 16.5 10.5 15.5 10.5 15.5" />
    <path d="M10.5 15.5C10.5 15.5 11 16.5 12 16.5C13 16.5 13.5 15.5 13.5 15.5" />
    <path d="M13.5 15.5C13.5 15.5 14 16.5 14.5 16.5C16 16.5 17 14.5 17 14.5" />
    {/* Teeth */}
    <path d="M10.5 15.5V14.5" />
    <path d="M13.5 15.5V14.5" />
  </svg>
)

/** Dzień Matki / Ojca / Babci / Dziadka — family heart with people */
export const DzieńRodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18C12 18 5 13 5 9C5 7 7 5 9 5C10.2 5 11.2 5.8 12 6.8C12.8 5.8 13.8 5 15 5C17 5 19 7 19 9C19 13 12 18 12 18Z" />
    <circle cx="8" cy="21" r="1.5" />
    <circle cx="12" cy="21" r="1.5" />
    <circle cx="16" cy="21" r="1.5" />
    <path d="M8 19.5V18.5" />
    <path d="M12 19.5V18.5" />
    <path d="M16 19.5V18.5" />
  </svg>
)

/** Chrzest i komunia — baptism candle with cross and gentle flame */
export const ChrzestIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Candle body */}
    <rect x="9" y="8" width="6" height="12" rx="1" />
    {/* Candle base/holder */}
    <path d="M7.5 20H16.5" />
    <path d="M8 20V22" />
    <path d="M16 20V22" />
    <path d="M7 22H17" />
    {/* Wick */}
    <path d="M12 8V5.5" />
    {/* Flame — teardrop shape */}
    <path d="M12 5.5C12 5.5 10.5 3.5 12 1.5C13.5 3.5 12 5.5 12 5.5Z" />
    {/* Inner flame glow */}
    <path d="M12 4.5C12 4.5 11.3 3.5 12 2.5C12.7 3.5 12 4.5 12 4.5Z" />
    {/* Cross on candle */}
    <path d="M12 11V16" />
    <path d="M10 13H14" />
    {/* Light rays */}
    <path d="M9 3L8 2.5" />
    <path d="M15 3L16 2.5" />
  </svg>
)

/** Wieczór Panieński — elegant high heel shoe */
export const WieczórPanieńskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17L5 9C5 9 6 5 9 5C11 5 12 7 13 9C14 11 15.5 13 20 13" />
    <path d="M20 13V17" />
    <path d="M3 17H20" />
    <path d="M3 17V19.5" />
    <path d="M2 19.5H5" />
    <path d="M20 17V19" />
    <path d="M9 5C9 5 9.5 4 10 4" />
    <path d="M7 9L8 8" />
    <path d="M10 12L11 11" />
  </svg>
)

/** Wieczór Kawalerski — bow tie with collar */
export const WieczórKawalerskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8L10 12L4 16V8Z" />
    <path d="M20 8L14 12L20 16V8Z" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
    <path d="M8 6L10 8" />
    <path d="M16 6L14 8" />
    <path d="M8 18L10 16" />
    <path d="M16 18L14 16" />
    <path d="M5 9L5 15" />
    <path d="M19 9L19 15" />
  </svg>
)

/** Baby Shower — baby bottle with bubbles */
export const BabyShowerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="8" height="13" rx="3" />
    <path d="M10 8V5C10 4 10.5 3 12 3C13.5 3 14 4 14 5V8" />
    <path d="M10 3H14" />
    <path d="M10 2H14" />
    <path d="M8 13H16" />
    <path d="M8 17H16" />
    <circle cx="11" cy="15" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="13" cy="15" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
