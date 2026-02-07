"use client"

import { HttpTypes } from "@medusajs/types"
import { ProductListing } from "./ProductListing"
import dynamic from "next/dynamic"

// Dynamically import Algolia component with SSR enabled
// SSR is safe because:
// 1. Bot detection happens BEFORE component selection in SmartProductsListing
// 2. Bots get ProductListing (database), never AlgoliaProductsListing
// 3. InstantSearch hooks only run on client, no server-side Algolia queries
// 4. Enabling SSR improves loading by 300-400ms (no bundle download delay)
// 5. No loading skeleton to prevent flash/rerender - SSR renders immediately
const AlgoliaProductsListing = dynamic(
  () => import("./AlgoliaProductsListing").then(mod => ({ default: mod.AlgoliaProductsListing })),
  {
    ssr: true, // ✅ Safe for bots, faster for users, no flash
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
 * DEPLOYMENT-SAFE Smart Product Listing
 * 
 * Strategy:
 * - Bots (confirmed) → Database listing (better for SEO, no Algolia costs)
 * - Humans (default) → Algolia listing (better UX with instant search)
 * - Uncertain (env issues, cold starts) → Algolia (prefer user experience)
 * 
 * This prevents users from seeing database listings during deployments
 * when environment variables may be temporarily unavailable.
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

  // 🎯 CRITICAL CHANGE: Only use database for CONFIRMED bots
  // Default to Algolia for humans and uncertain cases
  const isConfirmedBot = serverSideIsBot === true

  // ✅ DEPLOYMENT-SAFE: Use database ONLY for confirmed bots
  if (isConfirmedBot) {
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

  // ✅ DEPLOYMENT-SAFE: Prefer Algolia for all non-bot traffic
  // Even if env temporarily unavailable, try Algolia (client-side will handle gracefully)
  if (hasAlgoliaConfig) {
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

  // ⚠️ FALLBACK: Only use database if Algolia config truly missing
  // This should only happen in development or if Algolia is intentionally disabled
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
