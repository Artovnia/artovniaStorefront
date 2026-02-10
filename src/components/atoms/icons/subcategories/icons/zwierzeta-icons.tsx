/**
 * ZWIERZĘTA (Pets) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Smycze — detailed leash with carabiner clip and wrist loop */
export const SmyczeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3C3.5 3 2.5 4 2.5 5.5C2.5 7 3.5 8 5 8C6.5 8 7.5 7 7.5 5.5C7.5 4 6.5 3 5 3Z" />
    <path d="M5 8V10.5" />
    <path d="M5 10.5C5 10.5 5.5 13 7.5 15C9.5 17 12 18 14.5 18" />
    <path d="M14.5 18L16 17.5" />
    <rect x="16" y="15.5" width="4" height="6" rx="0.8" />
    <path d="M18 15.5V14C18 13 18.5 12.5 19.5 12.5" />
    <path d="M16 18.5H20" />
    <path d="M3.5 5L4 5.5" />
    <path d="M7 11C7 11 8 10 8.5 10.5" />
  </svg>
)

/** Szelki — pet harness with buckles, chest plate and straps */
export const SzelkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="11" rx="8" ry="5.5" />
    <path d="M12 5.5V16.5" />
    <path d="M7 8L4.5 5" />
    <path d="M17 8L19.5 5" />
    <path d="M3.5 5L5.5 4" />
    <path d="M20.5 5L18.5 4" />
    <path d="M8 11H16" />
    <rect x="10.5" y="9.5" width="3" height="3" rx="0.8" />
    <path d="M7 8C7 8 7 9 7.5 10" />
    <path d="M17 8C17 8 17 9 16.5 10" />
    <circle cx="4.5" cy="5" r="0.8" />
    <circle cx="19.5" cy="5" r="0.8" />
    <path d="M9 14L8 15.5" />
    <path d="M15 14L16 15.5" />
  </svg>
)

/** Obroże — pet collar with buckle and dangling tag */
export const ObrożeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="7" rx="8.5" ry="4" />
    <path d="M5 5L4 4" />
    <path d="M19 5L20 4" />
    <rect x="10.5" y="5.5" width="3" height="3" rx="0.5" />
    <path d="M12 11V13" />
    <path d="M10 14L12 13L14 14" />
    <path d="M12 13V15" />
    <circle cx="12" cy="16" r="1" />
    <path d="M7 9L7 10" />
    <path d="M17 9L17 10" />
  </svg>
)

/** Chustki i bandany — folded bandana with pattern */
export const ChustkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4L21 4L12 21Z" />
    <path d="M7 4C7 4 8.5 8 12 8C15.5 8 17 4 17 4" />
    <path d="M9 4L12 14L15 4" />
    <path d="M8 11L12 14L16 11" />
    <path d="M10 17L12 21L14 17" />
  </svg>
)

/** Zawieszki i identyfikatory — pet tag on ring */
export const ZawieszkiIdIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6V8" />
    <path d="M8 10L16 10L17 16L12 21L7 16L8 10Z" />
    <circle cx="12" cy="14" r="1.5" />
    <path d="M9.5 11L14.5 11" />
    <path d="M9 13L8 16" />
    <path d="M15 13L16 16" />
  </svg>
)

/** Miski — pet bowl with food and paw print */
export const MiskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9C3 9 4 15 12 15C20 15 21 9 21 9" />
    <path d="M2 9H22" />
    <path d="M7 15V16.5" />
    <path d="M17 15V16.5" />
    <path d="M6 17H18" />
    <path d="M8 7C8 7 9 5 10 6C11 7 9 8 8 7Z" />
    <path d="M14 6C14 6 15 4 16 5C17 6 15 7 14 6Z" />
    <path d="M11 5C11 5 12 3 13 4C14 5 12 6 11 5Z" />
  </svg>
)

/** Legowiska — cozy pet bed with cushion */
export const LegowiskaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 16C3 16 3 11 6 10C8 9.5 9.5 11 12 11C14.5 11 16 9.5 18 10C21 11 21 16 21 16" />
    <path d="M2 16H22" />
    <path d="M4 16V18.5" />
    <path d="M20 16V18.5" />
    <path d="M3 18.5H21" />
    <path d="M7 13C7 13 8 12 9 12.5" />
    <path d="M17 13C17 13 16 12 15 12.5" />
    <ellipse cx="12" cy="7" rx="2" ry="1" />
    <path d="M10 7L11 5" />
    <path d="M14 7L13 5" />
  </svg>
)
