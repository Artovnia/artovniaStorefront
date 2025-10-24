/**
 * Custom SVG Icons for ONA (Her) Subcategories
 * Handcrafted for art & handcraft marketplace
 */

import React from 'react'

const iconColor = "#3B3634"

interface IconProps {
  className?: string
}

// Biżuteria (Jewelry)
export const BiżuteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C12 4 8 6 6 8C4 10 3 12 3 14" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 4C12 4 16 6 18 8C20 10 21 12 21 14" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="3" stroke={iconColor} strokeWidth="1.5"/>
    <path d="M12 13L12 10" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill={iconColor}/>
  </svg>
)

// Ubrania (Clothes)
export const UbraniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4L10 8L10 20L14 20L14 8L16 4" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 8L8 10L8 20" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 8L16 10L16 20" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="5" r="1.5" stroke={iconColor} strokeWidth="1.5"/>
    <path d="M10 14L14 14" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// Torebki i plecaki (Bags and backpacks)
export const TorebkiPlecakiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 10L6 19C6 19.5 6.5 20 7 20L17 20C17.5 20 18 19.5 18 19L18 10" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 10L20 10L19 8L5 8L4 10Z" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 8C9 6 10 4 12 4C14 4 15 6 15 8" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 13C10 13 11 14 12 14C13 14 14 13 14 13" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// Dodatki (Accessories)
export const DodatkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8C4 8 6 6 12 6C18 6 20 8 20 8" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 8L8 18" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 8L16 18" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 18L10 20" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 18L14 20" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
