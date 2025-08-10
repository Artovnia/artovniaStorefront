import {
  BannerSection,
  BlogSection,
  Hero,
  HomePopularBrandsSection,
  HomeProductSection,
  ShopByStyleSection,
  HomeNewestProductsSection,
  SmartBestProductsSection,
  DesignerOfTheWeekSection,
} from "@/components/sections"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home",
  description:
    "Artovnia - market sztuki i rękodzieła",
  openGraph: {
    title: "Artovnia - market sztuki i rękodzieła",
    description:
      "Artovnia - market sztuki i rękodzieła",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Artovnia - market sztuki i rękodzieła",
    type: "website",
    images: [
      {
        url: "/B2C_Storefront_Open_Graph.png",
        width: 1200,
        height: 630,
        alt: "Artovnia - market sztuki i rękodzieła",
      },
    ],
  },
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="flex flex-col text-primary">
      {/* Content with max-width container */}
      <div className="mx-auto max-w-[1920px] w-full">
        <Hero
          image="/images/hero/Image.jpg"
          heading="Witaj w Artovni"
          paragraph="Platformie sprzedażowej sztuki i rękodzieła."
          buttons={[
            { label: "Zobacz produkty", path: "/categories" },
            {
              label: "Sprzedaj produkty",
              path:
                process.env.NEXT_PUBLIC_ALGOLIA_ID
                  ? "https://artovniapanel.netlify.app/login"
                  : "https://artovniapanel.netlify.app/login",
            },
          ]}
        />
      </div>
      
      {/* Smart Best Products Section */}
      <div className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 mb-8 min-h-[400px] py-8">
        <SmartBestProductsSection
         />
      </div>
     
      {/* Full width dark section */}
      <div className="w-full bg-[#3B3634]">
        {/* Content container inside full-width section */}
        <div className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 min-h-[400px] py-8 font-instrument-sans">
          <HomeProductSection 
            heading="Nowości" 
          
            theme="light" 
            headingFont="font-instrument-serif italic" 
            headingSpacing="mb-12" 
            textTransform="normal-case" 
          />
        </div>
      </div>
      
      {/* Designer of the Week Section */}
      <div className="w-full bg-[#F4F0EB] min-h-[400px] py-8">
        <DesignerOfTheWeekSection />
      </div>

      {/* Content with max-width container */}
      <div className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 mt-8 ">
        {/*<BannerSection />*/}
        {/*<ShopByStyleSection />*/}
        <BlogSection />
      </div>
    </main>
  )
}
