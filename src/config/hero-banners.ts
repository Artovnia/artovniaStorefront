import type { HeroBanner } from "@/components/sections/Hero/Hero"



export const HERO_BANNERS: HeroBanner[] = [

  
  {
    id: "main-odkrywaj",
    image: "/images/hero/Hero21.webp",
    alt: "Odkrywaj nowe produkty w Artovnia",
    url: "/categories",
    focalPoint: {
      desktop: 'center center',
      mobile: '25% center'
    },
    content: {
      useLogo: true,
      paragraph: "Bliżej rękodzieła. Bliżej Twórców",
      cta: "Zobacz produkty",
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "odkrywaj-promocje",
    image: "/images/hero/Hero22.webp",
    alt: "Promocje",
    url: "/promotions",
    focalPoint: {
      desktop: 'center center',
      mobile: 'center center'
    },
    content: {
      heading: "Aktualne promocje",
      paragraph: "Zobacz aktualne promocje naszych projektantów",
      cta: "Zobacz Oferty",
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "sprzedawaj-w-artovnia",
    image: "/images/hero/Hero23.webp",
    alt: "Sprzedawaj w Artovnia",
    url: "https://artovniapanel.netlify.app/login",
    focalPoint: {
      desktop: 'center center',
      mobile: '36% center'
    },
    content: {
      heading: "Dołącz do nas",
      paragraph: "Otwórz  sklep i zacznij sprzedawać swoje rękodzieło",
      cta: "Załóż sklep",
      alignment: 'center',
      verticalAlignment: 'center'
    }
  },
  {
    id: "obrazy",
    image: "/images/hero/Hero24.webp",
    alt: "Obrazy",
    url: "/categories/obrazy",
    focalPoint: {
      desktop: 'center center',
      mobile: 'center center'
    },
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
  priorityLoadCount: 5 // Load all carousel images with priority to prevent production loading issues
}