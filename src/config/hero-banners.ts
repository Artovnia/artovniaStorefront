import type { HeroBanner } from "@/components/sections/Hero/Hero"



export const HERO_BANNERS: HeroBanner[] = [

  
  {
    id: "main-odkrywaj",
    image: "/images/hero/Hero21.webp",
    mobileImage: "/images/hero/Hero21-mobile.webp",
    alt: "Odkrywaj nowe produkty w Artovnia",
    url: "/categories",
    focalPoint: {
      desktop: 'center center', // Adjust to ensure key graphic elements are visible on desktop
      mobile: 'center center'   // Adjust to ensure key graphic elements are visible on mobile
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
    mobileImage: "/images/hero/Hero22-mobile.webp",
    alt: "Promocje",
    url: "/promotions",
    focalPoint: {
      desktop: 'center center', // Example: '60% 40%' to focus on right side, upper area
      mobile: 'center center'   // Example: '50% 30%' to focus on specific product
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
    mobileImage: "/images/hero/Hero23-mobile.webp",
    alt: "Sprzedawaj w Artovnia",
    url: "https://artovniapanel.netlify.app/login",
    focalPoint: {
      desktop: 'center center', // Example: 'left center' to focus on left side
      mobile: 'center center'   // Example: '40% 50%' to focus on left-center area
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
    mobileImage: "/images/hero/Hero24-mobile.webp",
    alt: "Obrazy",
    url: "/categories/obrazy",
    focalPoint: {
      desktop: 'center center', // Example: '50% 60%' to focus on lower-center area
      mobile: 'center center'   // Example: 'center bottom' to focus on bottom area
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