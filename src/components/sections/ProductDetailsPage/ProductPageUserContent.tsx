"use client"

import { useProductUserData } from "@/components/context/ProductUserDataProvider"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import { SuggestedProductsGallery } from "../SuggestedProductsGallery/SuggestedProductsGallery"
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
import { useMemo } from "react"

interface ProductPageUserContentProps {
  productId: string
  sellerProducts: any[]
  suggestedProducts: any[]
  suggestedCategoryName: string
  suggestedCategoryHandle: string
  prefetchedReviews: any[]
  sellerName?: string
  sellerHandle?: string
}

/**
 * Client component that renders user-specific content on product pages.
 * 
 * This component uses the ProductUserDataProvider context to get
 * user data (customer, wishlist, review eligibility) that was fetched
 * client-side, allowing the parent server component to use ISR caching.
 * 
 * Note: Products are memoized to prevent re-shuffling on wishlist changes.
 * Wishlist state is managed locally in WishlistButton for optimistic updates.
 */
export function ProductPageUserContent({
  productId,
  sellerProducts,
  suggestedProducts,
  suggestedCategoryName,
  suggestedCategoryHandle,
  prefetchedReviews,
}: ProductPageUserContentProps) {
  const { 
    customer, 
    wishlist, 
    isAuthenticated, 
    isEligibleForReview, 
    hasPurchased,
    isLoading 
  } = useProductUserData()

  // ✅ OPTIMIZATION: Memoize products to prevent re-renders on wishlist changes
  // Products are stable from server - only wishlist state should change
  const memoizedSellerProducts = useMemo(() => sellerProducts, [sellerProducts])
  const memoizedSuggestedProducts = useMemo(() => suggestedProducts, [suggestedProducts])

  return (
    <>
      {/* Seller products section */}
      <HomeProductSection
        heading=""
        headingSpacing="mb-0"
        theme="dark"
        products={memoizedSellerProducts}
        isSellerSection={true}
        user={customer}
        wishlist={wishlist}
        noMobileMargin={true}
      />

      {/* Suggested products section */}
      {memoizedSuggestedProducts.length > 0 && (
        <div className="my-12 xl:my-24 text-black max-w-[1920px] mx-auto">
          <SuggestedProductsGallery
            products={memoizedSuggestedProducts}
            categoryName={suggestedCategoryName}
            categoryHandle={suggestedCategoryHandle}
            user={customer}
            wishlist={wishlist}
          />
        </div>
      )}

      {/* Reviews section */}
      <div className="max-w-[1920px] mx-auto">
        <ProductReviews
          productId={productId}
          isAuthenticated={isAuthenticated}
          customer={customer}
          prefetchedReviews={prefetchedReviews}
          isEligible={isEligibleForReview}
          hasPurchased={hasPurchased}
        />
      </div>
    </>
  )
}
