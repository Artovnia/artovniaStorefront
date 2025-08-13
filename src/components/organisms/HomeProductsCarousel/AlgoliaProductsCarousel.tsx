"use client"

import { Carousel } from "@/components/cells"
import { client } from "@/lib/client"
import { Configure, useHits } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { ProductCard } from "../ProductCard/ProductCard"

export const AlgoliaProductsCarousel = ({
  locale,
  seller_handle,
  currency_code,
}: {
  locale: string
  seller_handle?: string
  currency_code: string
}) => {
  const filters = `${
    seller_handle
      ? `NOT seller:null AND seller.handle:${seller_handle} AND `
      : "NOT seller:null AND "
  }NOT seller.store_status:SUSPENDED AND supported_countries:${locale} AND variants.prices.currency_code:${currency_code}`

  return (
    <InstantSearchNext searchClient={client} indexName="products">
      <Configure hitsPerPage={4} filters={filters} />
      <ProductsListing locale={locale} />
    </InstantSearchNext>
  )
}

const ProductsListing = ({ locale }: { locale: string }) => {
  // OPTIMIZATION: Remove redundant Medusa API call - use only Algolia data
  // This eliminates the expensive listProducts call that fetches ALL products
  const { items } = useHits()
  
  // REMOVED: Redundant useEffect that was fetching 99999 products from Medusa
  // The Algolia hits already contain all necessary product data

  return (
    <>
      <div className="flex justify-between w-full items-center"></div>
      <div className="w-full ">
        {!items.length ? (
          <div className="text-center w-full my-10">
            <h2 className="uppercase text-primary heading-lg">no results</h2>
            <p className="mt-4 text-lg">
              Sorry, we can&apos;t find any results for your criteria
            </p>
          </div>
        ) : (
          <div className="w-full">
            <Carousel
              align="start"
              items={items.map((hit) => {
                // OPTIMIZATION: Use Algolia hit data directly
                // No need to merge with API data since Algolia contains all necessary product info
                return (
                  <ProductCard
                    key={hit.objectID}
                    product={hit}
                  />
                )
              })}
            />
          </div>
        )}
      </div>
    </>
  )
}
