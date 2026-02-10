/**
 * VINTAGE icons — ornate, antique-inspired designs
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Moda vintage — dress form mannequin with ornate stand */
export const ModaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3C9 3 10 1.5 12 1.5C14 1.5 15 3 15 3" />
    <path d="M9 3C7.5 5 6.5 8 6.5 10C6.5 12 7.5 14 9 15" />
    <path d="M15 3C16.5 5 17.5 8 17.5 10C17.5 12 16.5 14 15 15" />
    <path d="M9 15H15" />
    <path d="M12 15V18" />
    <path d="M9 18H15" />
    <path d="M9 18L8 22" />
    <path d="M15 18L16 22" />
    <path d="M7 22H17" />
    <path d="M10 6H14" />
    <path d="M9.5 9H14.5" />
    <path d="M10 12H14" />
    <circle cx="12" cy="3" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Dom vintage — ornate antique oil lamp */
export const DomVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 10H14L15 8H9L10 10Z" />
    <path d="M10 10C8.5 10 7 11.5 7 13.5C7 15.5 8.5 17 10 17" />
    <path d="M14 10C15.5 10 17 11.5 17 13.5C17 15.5 15.5 17 14 17" />
    <path d="M10 17H14" />
    <path d="M9 17L8 19H16L15 17" />
    <path d="M8 19H16" />
    <path d="M9 19V21" />
    <path d="M15 19V21" />
    <path d="M7 21H17" />
    <path d="M11 8V6" />
    <path d="M13 8V6" />
    <path d="M10 6H14" />
    <path d="M12 6V4" />
    <path d="M11 3C11 3 11.5 2 12 2C12.5 2 13 3 13 3" />
    <path d="M10.5 4C10.5 4 11 3 12 3C13 3 13.5 4 13.5 4" />
  </svg>
)

/** Biżuteria vintage — ornate cameo brooch with frame */
export const BiżuteriaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="7" ry="8" />
    <ellipse cx="12" cy="12" rx="5" ry="6" />
    <path d="M12 6C12 6 10 8 10 10C10 12 12 14 12 14" />
    <path d="M12 14C12 14 14 12 14 10C14 8 12 6 12 6" />
    <path d="M12 4L12 2" />
    <path d="M5 8L3 6.5" />
    <path d="M19 8L21 6.5" />
    <path d="M5 16L3 17.5" />
    <path d="M19 16L21 17.5" />
    <path d="M12 20L12 22" />
    <circle cx="12" cy="10" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Zegarki — ornate pocket watch with chain */
export const ZegarkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="7" />
    <circle cx="12" cy="13" r="5.5" />
    <path d="M12 9V13L14.5 14.5" />
    <circle cx="12" cy="13" r="0.8" />
    <path d="M12 6V4" />
    <path d="M10 4H14" />
    <path d="M12 4C12 4 10 3 10 2" />
    <path d="M12 4C12 4 14 3 14 2" />
    <path d="M9 7.5L7.5 6.5" />
    <path d="M15 7.5L16.5 6.5" />
    <path d="M7 10L5.5 9.5" />
    <path d="M17 10L18.5 9.5" />
    <path d="M12 18.5V20" />
  </svg>
)

/** Kolekcje i antyki — ornate treasure chest with keyhole */
export const KolekcjeAntyikiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="9" rx="1" />
    <path d="M3 11C3 11 3 6 12 6C21 6 21 11 21 11" />
    <path d="M3 15H21" />
    <path d="M10 15V18H14V15" />
    <circle cx="12" cy="16.5" r="0.8" />
    <path d="M12 11V15" />
    <path d="M6 11V8" />
    <path d="M18 11V8" />
    <path d="M7 6.5L6 5" />
    <path d="M17 6.5L18 5" />
    <path d="M12 6V4.5" />
    <circle cx="12" cy="4" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
