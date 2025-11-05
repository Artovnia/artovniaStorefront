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
    image: "/images/hero/Hero01.webp", // Background only
    mobileImage: "/images/hero/Hero01-mobile.webp", // Optional mobile version
    alt: "Odkrywaj nowe produkty w Artovnia",
    url: "/categories",
    content: {
      heading: {
        text: "ARTOVNIA",
        highlightedWord: "",
        font: 'regular', // font-instrument-serif
        highlightFont: 'italic', // font-instrument-serif italic
        size: {
          mobile: "text-4xl",
          tablet: "text-6xl",
          desktop: "text-7xl"
        }
      },
      paragraph: {
        text: "Bliżej rękodzieła. Bliżej Twórców",
        size: {
          mobile: "text-md",
          tablet: "text-lg",
          desktop: "text-2xl"
        }
      },
      cta: {
        text: "Zobacz produkty",
        variant: 'primary'
      },
      textColor: 'white',
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "odkrywaj-promocje",
    image: "/images/hero/Hero03.webp",
    mobileImage: "/images/hero/Hero03-mobile.webp",
    alt: "Promocje",
    url: "/promotions",
    content: {
      heading: {
        text: "Aktualne Promocje",
        highlightedWord: "Promocje",
        font: 'regular',
        highlightFont: 'italic',
        size: {
          mobile: "text-4xl",
          tablet: "text-6xl",
          desktop: "text-7xl"
        }
      },
      paragraph: {
        text: "Zobacz aktualne promocje naszych projektantów",
        size: {
          mobile: "text-md",
          tablet: "text-lg",
          desktop: "text-2xl"
        }
      },
      cta: {
        text: "Zobacz Oferty",
        variant: 'secondary'
      },
      textColor: 'white',
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "sprzedawaj-w-artovnia",
    image: "/images/hero/Hero04.webp",
    mobileImage: "/images/hero/Hero04-mobile.webp",
    alt: "Sprzedawaj w Artovnia",
    url: "https://artovniapanel.netlify.app/login",
    content: {
      heading: {
        text: "Dołącz do nas",
        highlightedWord: "nas",
        font: 'regular',
        highlightFont: 'italic',
        size: {
          mobile: "text-4xl",
          tablet: "text-6xl",
          desktop: "text-7xl"
        }
      },
      paragraph: {
        text: "Otwórz swój sklep i zacznij sprzedawać swoje rękodzieło",
        size: {
          mobile: "text-md",
          tablet: "text-lg",
          desktop: "text-2xl"
        }
      },
      cta: {
        text: "Załóż sklep",
        variant: 'primary'
      },
      textColor: 'white',
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "obrazy",
    image: "/images/hero/Hero05.webp",
    mobileImage: "/images/hero/Hero05-mobile.webp",
    alt: "Obrazy",
    url: "/categories/obrazy",
    content: {
      heading: {
        text: "Sztuka w Twoim domu",
        highlightedWord: "Twoim domu",
        font: 'regular',
        highlightFont: 'italic',
        size: {
          mobile: "text-4xl",
          tablet: "text-6xl",
          desktop: "text-7xl"
        }
      },
      paragraph: {
        text: "Ręcznie malowane obrazy przez polskich artystów",
        size: {
          mobile: "text-md",
          tablet: "text-lg",
          desktop: "text-2xl"
        }
      },
      cta: {
        text: "Zobacz obrazy",
        variant: 'secondary'
      },
      textColor: 'white',
      alignment: 'center',
      verticalAlignment: 'center'
    }
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
