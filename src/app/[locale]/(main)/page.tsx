import {
  AlgoliaTrendingListings,
  BannerSection,
  BlogSection,
  Hero,
  HomeCategories,
  HomePopularBrandsSection,
  HomeProductSection,
  ShopByStyleSection,
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
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-primary">
      <Hero
        image="/images/hero/Image.jpg"
        heading="Witaj w Artovni"
        paragraph="W naszym sklepie znajdziesz najlepsze produkty z ręczniaków, sztuk i rękodzieł."
        buttons={[
          { label: "Zobacz produkty", path: "/categories" },
          {
            label: "Sprzedaj produkty",
            path:
              process.env.NEXT_PUBLIC_ALGOLIA_ID === "UO3C5Y8NHX"
                ? "https://vendor-sandbox.vercel.app/"
                : "https://vendor.mercurjs.com",
          },
        ]}
      />
      <div className="px-4 lg:px-8 w-full">
        <HomeProductSection heading="Najlepsze produkty" locale={locale} home />
      </div>
      {/* <HomePopularBrandsSection />*/}
      <div className="px-4 lg:px-8 w-full">
        <HomeCategories heading="KUPUJ WEDŁUG KATEGORII" />
      </div>
      <BannerSection />
      <ShopByStyleSection />
      <BlogSection />
    </main>
  )
}
