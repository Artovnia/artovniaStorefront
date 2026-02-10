/**
 * NOWOŚCI (New arrivals) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Nowości tygodnia — calendar page with sparkle */
export const NowościTygodniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 9H20" />
    <path d="M8 3V6" />
    <path d="M16 3V6" />
    <path d="M12 12.5L13.1 14.8L15.6 15.1L13.8 16.8L14.2 19.3L12 18.1L9.8 19.3L10.2 16.8L8.4 15.1L10.9 14.8Z" />
    <path d="M7 12H8" />
    <path d="M16 12H17" />
  </svg>
)

/** Ostatnio dodane — clock with decorative hands */
export const OstatnioIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="9" />
    <path d="M12 7V13L15.5 15.5" />
    <path d="M12 4V5" />
    <path d="M20 13H21" />
    <path d="M3 13H4" />
    <path d="M12 21V22" />
    <circle cx="12" cy="13" r="1" />
    <path d="M18 3L20 5" />
    <path d="M19 2L21 4" />
  </svg>
)

/** Nowe kolekcje — four-point sparkle star */
export const NoweKolekcjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 13 8 14 10C15 12 22 12 22 12C22 12 15 13 14 14C13 15 12 22 12 22C12 22 11 15 10 14C9 13 2 12 2 12C2 12 9 11 10 10C11 9 12 2 12 2Z" />
    <path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5Z" />
    <path d="M19 17L19.5 19L21 19.5L19.5 20L19 22L18.5 20L17 19.5L18.5 19Z" />
  </svg>
)

/** Rekomendacje redakcji — award ribbon badge */
export const RekomendacjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="6" />
    <circle cx="12" cy="9" r="3.5" />
    <path d="M12 5.5L12.8 7.2L14.6 7.5L13.3 8.7L13.6 10.5L12 9.6L10.4 10.5L10.7 8.7L9.4 7.5L11.2 7.2Z" />
    <path d="M8 14.5L6 22L9.5 19.5L12 22" />
    <path d="M16 14.5L18 22L14.5 19.5L12 22" />
  </svg>
)
