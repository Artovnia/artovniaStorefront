/**
 * ALL Custom SVG Icons for Subcategories
 * Complete set for art & handcraft marketplace
 * Color: #3B3634
 */

import React from 'react'

const C = "#3B3634"
interface IconProps { className?: string }

// ONA (Her) - 4 icons
export const BiżuteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 4C12 4 8 6 6 8C4 10 3 12 3 14" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4C12 4 16 6 18 8C20 10 21 12 21 14" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="3" stroke={C} strokeWidth="1.5"/>
    <path d="M12 13L12 10" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill={C}/>
  </svg>
)

export const UbraniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 4L10 8L10 20L14 20L14 8L16 4" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 8L8 10L8 20" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8L16 10L16 20" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="5" r="1.5" stroke={C} strokeWidth="1.5"/>
    <path d="M10 14L14 14" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const TorebkiPlecakiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M6 10L6 19C6 19.5 6.5 20 7 20L17 20C17.5 20 18 19.5 18 19L18 10" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10L20 10L19 8L5 8L4 10Z" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8C9 6 10 4 12 4C14 4 15 6 15 8" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 13C10 13 11 14 12 14C13 14 14 13 14 13" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const DodatkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 8C4 8 6 6 12 6C18 6 20 8 20 8" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 8L8 18" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 8L16 18" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 18L10 20" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 18L14 20" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ON (Him) - 4 icons
export const BiżuteriaMęskaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="7" y="8" width="10" height="8" rx="1" stroke={C} strokeWidth="1.5"/>
    <path d="M9 8L9 6L15 6L15 8" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 16L9 18L15 18L15 16" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" stroke={C} strokeWidth="1.5"/>
    <path d="M12 10L12 12L13.5 13" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const UbraniaMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 6L10 4L12 5L14 4L16 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6L6 8L6 20L18 20L18 8L16 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 6L10 10L14 10L14 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 14L15 14" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const DodatkiMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M4 12L8 10L8 14L4 12Z" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 12L16 10L16 14L20 12Z" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="10" y="10" width="4" height="4" stroke={C} strokeWidth="1.5"/>
    <path d="M8 12L10 12" stroke={C} strokeWidth="1.5"/>
    <path d="M14 12L16 12" stroke={C} strokeWidth="1.5"/>
  </svg>
)

export const AkcesoriaMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="12" r="3" stroke={C} strokeWidth="1.5"/>
    <circle cx="16" cy="12" r="3" stroke={C} strokeWidth="1.5"/>
    <path d="M11 12L13 12" stroke={C} strokeWidth="1.5"/>
    <circle cx="8" cy="12" r="1" fill={C}/>
    <circle cx="16" cy="12" r="1" fill={C}/>
  </svg>
)

// DZIECKO (Children) - 4 icons
export const UbrankaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M8 6L9 4L12 5L15 4L16 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6L7 8L7 16C7 17 8 18 9 18L15 18C16 18 17 17 17 16L17 8L16 6" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10L14 10" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="10" cy="13" r="0.5" fill={C}/>
    <circle cx="12" cy="13" r="0.5" fill={C}/>
    <circle cx="14" cy="13" r="0.5" fill={C}/>
  </svg>
)

export const ZabawkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" stroke={C} strokeWidth="1.5"/>
    <circle cx="8" cy="8" r="2" stroke={C} strokeWidth="1.5"/>
    <circle cx="16" cy="8" r="2" stroke={C} strokeWidth="1.5"/>
    <circle cx="10.5" cy="11" r="0.5" fill={C}/>
    <circle cx="13.5" cy="11" r="0.5" fill={C}/>
    <path d="M11 13.5C11 13.5 11.5 14 12 14C12.5 14 13 13.5 13 13.5" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const DekoracjePokojuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 4L12 8" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4L8 6L12 8L16 6L12 4Z" stroke={C} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6L8 10L10 11L8 12L8 16" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 6L16 10L14 11L16 12L16 16" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 8L12 12L10 13L12 14L12 18" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const AkcesoriaДziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="10" r="4" stroke={C} strokeWidth="1.5"/>
    <path d="M12 14L12 17" stroke={C} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="10" y="17" width="4" height="2" rx="1" stroke={C} strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="2" stroke={C} strokeWidth="1.5"/>
  </svg>
)

// Generic fallback
export const GenericSubcategoryIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" stroke={C} strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke={C} strokeWidth="1.5"/>
  </svg>
)
