"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { detectBot } from "@/lib/utils/bot-detection"
import { ProductListing } from "./ProductListing"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import dynamic from "next/dynamic"

// Dynamically import Algolia component to prevent loading for bots
const AlgoliaProductsListing = dynamic(
  () => import("./AlgoliaProductsListing").then(mod => ({ default: mod.AlgoliaProductsListing })),
  {
    loading: () => <ProductListingSkeleton />,
    ssr: false, // Disable SSR for Algolia to prevent server-side queries
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

  const [isBot, setIsBot] = useState(serverSideIsBot)
  const [isHydrated, setIsHydrated] = useState(false)
  const [shouldUseAlgolia, setShouldUseAlgolia] = useState(false)

  // Check Algolia configuration
  const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  const hasAlgoliaConfig = !!(ALGOLIA_ID && ALGOLIA_SEARCH_KEY)

  useEffect(() => {
    // Client-side bot detection after hydration
    const clientIsBot = detectBot()
    const finalIsBot = serverSideIsBot || clientIsBot
    
    setIsBot(finalIsBot)
    setIsHydrated(true)

    // Only use Algolia for confirmed human users with valid config
    setShouldUseAlgolia(hasAlgoliaConfig && !finalIsBot)

    // Debug logging for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 Bot Detection Debug:', {
        serverSideIsBot,
        clientIsBot,
        finalIsBot,
        hasAlgoliaConfig,
        shouldUseAlgolia: hasAlgoliaConfig && !finalIsBot,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      })
    }
  }, [serverSideIsBot, hasAlgoliaConfig])

  // Show loading skeleton during hydration
  if (!isHydrated) {
    return <ProductListingSkeleton />
  }

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
    if (process.env.NODE_ENV === 'development') {
      console.log('🤖 Using ProductListing (Database) - Bot detected')
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Using AlgoliaProductsListing - Human user detected')
    }
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
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Using ProductListing (Database) - Fallback mode')
  }
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
