import type { HeroBanner } from "@/components/sections/Hero/Hero"

/**
 * Hero Banner Configuration
 * 
 * This file contains all banner configurations for the Hero carousel.
 * To add/modify banners, simply update this configuration.
 * 
 * For Sanity CMS integration in the future, this can serve as a fallback
 * or be replaced with dynamic data fetching.
 */

export const HERO_BANNERS: HeroBanner[] = [
  {
    id: "main-odkrywaj",
    image: "/images/hero/Hero01.png",
    alt: "Odkrywaj nowe produkty w Artovnia",
    url: "/categories"
  },
  
  {
    id: "odkrywaj-promocje",
    image: "/images/hero/Hero03.png", 
    alt: "Promocje",
    url: "/promotions"
  },
  {
    id: "sprzedawaj-w-artovnia",
    image: "/images/hero/Hero04.png", 
    alt: "Sprzedawaj w Artovnia",
    url: "https://artovniapanel.netlify.app/login"
  },
  {
    id: "obrazy",
    image: "/images/hero/Hero05.png", 
    alt: "Obrazy",
    url: "/categories/obrazy"
  }
]

/**
 * Hero Configuration Settings
 */
export const HERO_CONFIG = {
  autoSwitchInterval: 8000, // 8 seconds
  pauseOnHover: true,
  resumeAfterManualNavigation: 12000, // 12 seconds
  transitionDuration: 700, // milliseconds
  imageQuality: 90,
  priorityLoadCount: 2 // Number of images to load with priority
}

/**
 * Responsive breakpoints for hero sizing
 */
export const HERO_BREAKPOINTS = {
  mobile: {
    height: "40vh",
    minHeight: "300px",
    maxHeight: "500px"
  },
  tablet: {
    height: "45vh", 
    minHeight: "350px",
    maxHeight: "600px"
  },
  desktop: {
    height: "50vh",
    minHeight: "400px", 
    maxHeight: "800px"
  }
}
