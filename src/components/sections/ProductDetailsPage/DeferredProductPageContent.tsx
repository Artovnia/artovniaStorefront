import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { PDP_SELLER_CARD_FIELDS } from "@/lib/constants/product-fields"
import {
  listProductsLean,
  listSuggestedProducts,
} from "@/lib/data/products"

import { ProductPageUserContent } from "./ProductPageUserContent"

interface DeferredProductPageContentProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  prefetchedReviews?: any[]
}

export const DeferredProductPageContent = async ({
  product,
  region,
  prefetchedReviews = [],
}: DeferredProductPageContentProps) => {
  const [sellerProductsResult, suggestedProductsResult] = await Promise.allSettled([
    product.seller?.id
      ? listProductsLean({
          seller_id: product.seller.id,
          regionId: region.id,
          queryParams: {
            limit: 8,
            fields: PDP_SELLER_CARD_FIELDS,
          },
        }).then((r) => r.response.products)
      : Promise.resolve([]),
    listSuggestedProducts({ product, regionId: region.id, limit: 8 }),
  ])

  const sellerProducts =
    sellerProductsResult.status === "fulfilled" ? sellerProductsResult.value : []

  const suggestedProductsData =
    suggestedProductsResult.status === "fulfilled"
      ? suggestedProductsResult.value
      : { products: [], categoryName: "", categoryHandle: "" }

  return (
    <div
      className="my-12 xl:mt-40 text-black max-w-[1920px] mx-auto"
      aria-label={`Więcej produktów od ${product.seller?.name || "sprzedawcy"}`}
    >
      {/* Custom heading with mixed styling and button */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout: Grid with centered heading and right-aligned button */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div></div>
          <h2 className="heading-lg font-bold tracking-tight text-black text-center">
            <span className="font-instrument-serif">Więcej od </span>
            <span className="font-instrument-serif italic">{product.seller?.name}</span>
          </h2>
          <div className="flex justify-end">
            {product.seller?.handle && (
              <Link
                href={`/sellers/${product.seller.handle}`}
                className="group relative text-[#3B3634] font-instrument-sans font-medium px-4 py-2 overflow-hidden transition-all duration-300 hover:text-white"
                aria-label={`Zobacz wszystkie produkty od ${product.seller.name}`}
              >
                <span
                  className="absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"
                  aria-hidden="true"
                ></span>
                <span className="relative flex items-center gap-2">
                  Zobacz wszystkie
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Layout: Elegant artist signature approach */}
        <div className="lg:hidden space-y-4">
          <h2 className="heading-lg font-bold tracking-tight text-black text-center">
            <span className="font-instrument-serif">Więcej od </span>
            <span className="font-instrument-serif italic">{product.seller?.name}</span>
          </h2>

          {product.seller?.handle && (
            <div className="flex justify-center">
              <Link
                href={`/sellers/${product.seller.handle}`}
                className="group inline-flex items-center gap-3 font-instrument-serif italic text-[17px] text-[#3B3634] border-b-[1.5px] border-[#3B3634] pb-0.5 active:opacity-60 transition-all duration-200"
              >
                <span className="relative">
                  Odkryj kolekcję
                  <span className="absolute -bottom-[1.5px] left-0 w-0 h-[1.5px] bg-[#3B3634] group-active:w-full transition-all duration-300"></span>
                </span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-active:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      <ProductPageUserContent
        productId={product.id}
        sellerProducts={sellerProducts as any}
        suggestedProducts={suggestedProductsData.products as any}
        suggestedCategoryName={suggestedProductsData.categoryName}
        suggestedCategoryHandle={suggestedProductsData.categoryHandle}
        prefetchedReviews={prefetchedReviews}
        sellerName={product.seller?.name}
        sellerHandle={product.seller?.handle}
      />
    </div>
  )
}
