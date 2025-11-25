"use client"

import { HttpTypes } from "@medusajs/types"
import { ProductListing } from "./ProductListing"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import dynamic from "next/dynamic"

// Dynamically import Algolia component with SSR enabled
// SSR is safe because:
// 1. Bot detection happens BEFORE component selection in SmartProductsListing
// 2. Bots get ProductListing (database), never AlgoliaProductsListing
// 3. InstantSearch hooks only run on client, no server-side Algolia queries
// 4. Enabling SSR improves loading by 300-400ms (no bundle download delay)
const AlgoliaProductsListing = dynamic(
  () => import("./AlgoliaProductsListing").then(mod => ({ default: mod.AlgoliaProductsListing })),
  {
    loading: () => <ProductListingSkeleton />,
    ssr: true, // ✅ Safe for bots, faster for users
  }
)

interface SmartProductsListingProps {
  category_id?: string
  category_ids?: string[]
  collection_id?: string
  locale?: string
  seller_handle?: string
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
  serverSideIsBot?: boolean // Pass from server component
}

/**
 * Smart component that chooses between Algolia and Database based on bot detection
 * - Bots get database queries (better for SEO, no Algolia costs)
 * - Human users get Algolia (better UX with instant search)
 */
export const SmartProductsListing = (props: SmartProductsListingProps) => {
  const {
    category_id,
    category_ids,
    collection_id,
    seller_handle,
    locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
    categories = [],
    currentCategory,
    serverSideIsBot = false,
  } = props

  // Check Algolia configuration
  const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  const hasAlgoliaConfig = !!(ALGOLIA_ID && ALGOLIA_SEARCH_KEY)

  // ✅ OPTIMIZED: Use server-side bot detection directly (no hydration delay)
  // Bot detection happens on server, so we can use it immediately
  const isBot = serverSideIsBot
  const shouldUseAlgolia = hasAlgoliaConfig && !isBot

  // Force database mode if no Algolia config
  if (!hasAlgoliaConfig) {
    return (
      <ProductListing
        category_id={category_id}
        category_ids={category_ids}
        collection_id={collection_id}
        seller_id={seller_handle}
        categories={categories}
        currentCategory={currentCategory}
      />
    )
  }

  // Bot detected - use database listing
  if (isBot) {
    // Using database listing for bot
    return (
      <ProductListing
        category_id={category_id}
        category_ids={category_ids}
        collection_id={collection_id}
        seller_id={seller_handle}
        categories={categories}
        currentCategory={currentCategory}
      />
    )
  }

  // Human user with Algolia config - use Algolia
  if (shouldUseAlgolia) {
    // Using Algolia for human user
    return (
      <AlgoliaProductsListing
        category_id={category_id}
        category_ids={category_ids}
        collection_id={collection_id}
        seller_handle={seller_handle}
        locale={locale}
        categories={categories}
        currentCategory={currentCategory}
      />
    )
  }

  // Fallback to database listing
  return (
    <ProductListing
      category_id={category_id}
      category_ids={category_ids}
      collection_id={collection_id}
      seller_id={seller_handle}
      categories={categories}
      currentCategory={currentCategory}
    />
  )
}
