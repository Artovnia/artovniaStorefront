import {
  BannerSection,
  BlogSection,
  Hero,
  HomePopularBrandsSection,
  ShopByStyleSection,
  HomeNewestProductsSection,
  SmartBestProductsSection,
  HomeCategories,
  DesignerOfTheWeekSection,
} from "@/components/sections"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"

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
    <PromotionDataProvider countryCode="PL">
      <BatchPriceProvider currencyCode="PLN">
        <main className="flex flex-col text-primary">
          {/* Content with max-width container */}
          <div className="mx-auto max-w-[1920px] w-full">
            <Hero />
          </div>
          
          {/* Smart Best Products Section */}
          <div className="mx-auto max-w-[1920px] w-full  mb-8 min-h-[400px] py-8">
            <SmartBestProductsSection />
          </div>
         
          {/* Full width dark section */}
          <div className="w-full bg-[#3B3634]">
            {/* Content container inside full-width section */}
            <div className="mx-auto max-w-[1920px] w-full min-h-[400px] py-8 font-instrument-sans">
              <HomeNewestProductsSection 
                heading="Nowości" 
                locale={locale}
                limit={8}
                home={true}
              />
            </div>
          </div>

           {/* Categories Section */}
          <div className="w-full bg-primary py-8">
            <HomeCategories heading="Kategorie" />
          </div>
          
          {/* Designer of the Week Section */}
          <div className="w-full bg-[#F4F0EB] min-h-[400px] py-8">
            <DesignerOfTheWeekSection />
          </div>

          {/* Blog Section */}
          <div className="w-full bg-white py-8">
            <div className="mx-auto max-w-[1920px] w-full">
              <BlogSection />
            </div>
          </div>

         

    
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
  )
}
