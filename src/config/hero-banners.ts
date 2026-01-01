import type { HeroBanner } from "@/components/sections/Hero/Hero"



export const HERO_BANNERS: HeroBanner[] = [

  {
    id: "nowy-rok",
    image: "/images/hero/Hero06.webp",
    mobileImage: "/images/hero/Hero06-mobile.webp",
    alt: "Szczęśliwego Nowego Roku 2026",
    url: "/categories",
    objectPosition: 'left center',
    content: {
      heading: "Szczęśliwego",
      subheading: "NOWEGO ROKU 2026",
      paragraph: "Życzy zespół Artovnia"
    }
  },
  {
    id: "main-odkrywaj",
    image: "/images/hero/Hero01.webp",
    mobileImage: "/images/hero/Hero01-mobile.webp",
    alt: "Odkrywaj nowe produkty w Artovnia",
    url: "/categories",
    content: {
      heading: "ARTOVNIA",
      paragraph: "Bliżej rękodzieła. Bliżej Twórców",
      cta: "Zobacz produkty",
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
      heading: "Aktualne Promocje",
      paragraph: "Zobacz aktualne promocje naszych projektantów",
      cta: "Zobacz Oferty",
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
      heading: "Dołącz do nas",
      paragraph: "Otwórz swój sklep i zacznij sprzedawać swoje rękodzieło",
      cta: "Załóż sklep",
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
      heading: "Sztuka w Twoim domu",
      paragraph: "Ręcznie malowane obrazy przez polskich artystów",
      cta: "Zobacz obrazy",
      alignment: 'center',
      verticalAlignment: 'center'
    }
  }
]

export const HERO_CONFIG = {
  autoSwitchInterval: 8000,
  pauseOnHover: true,
  resumeAfterManualNavigation: 12000,
  transitionDuration: 700,
  imageQuality: 90,
  priorityLoadCount: 2
}