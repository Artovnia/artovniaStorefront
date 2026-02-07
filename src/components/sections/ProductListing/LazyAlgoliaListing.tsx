"use client"

import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductListing } from "./ProductListing"
import dynamic from "next/dynamic"

// Dynamically import Algolia with no SSR to prevent server queries
const AlgoliaProductsListing = dynamic(
  () => import("./AlgoliaProductsListing").then(mod => ({ default: mod.AlgoliaProductsListing })),
  {
    ssr: false,
  }
)

interface LazyAlgoliaListingProps {
  category_id?: string
  category_ids?: string[]
  collection_id?: string
  locale?: string
  seller_handle?: string
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
  loadAlgoliaOnInteraction?: boolean // Only load Algolia when user interacts
}

/**
 * Lazy-loading Algolia component that prevents automatic queries
 * - Shows database results first (instant, no Algolia cost)
 * - Only loads Algolia when user interacts (search, filter, etc.)
 * - Reduces bot traffic and unnecessary Algolia queries
 */
export const LazyAlgoliaListing = (props: LazyAlgoliaListingProps) => {
  const {
    category_id,
    category_ids,
    collection_id,
    seller_handle,
    locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
    categories = [],
    currentCategory,
    loadAlgoliaOnInteraction = true,
  } = props

  const [shouldLoadAlgolia, setShouldLoadAlgolia] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const interactionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Check Algolia configuration
  const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  const hasAlgoliaConfig = !!(ALGOLIA_ID && ALGOLIA_SEARCH_KEY)

  useEffect(() => {
    if (!loadAlgoliaOnInteraction || !hasAlgoliaConfig) {
      return
    }

    const container = containerRef.current
    if (!container) return

    // Interaction handlers that trigger Algolia loading
    const handleInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true)
        
        // Delay Algolia loading slightly to avoid immediate query spam
        interactionTimeoutRef.current = setTimeout(() => {
          setShouldLoadAlgolia(true)
        }, 100)
      }
    }

    // Events that indicate user wants to interact with search/filters
    const interactionEvents = [
      'click',
      'focus',
      'keydown',
      'touchstart',
      'mouseenter', // Hover indicates intent to interact
    ]

    // Add event listeners to container
    interactionEvents.forEach(event => {
      container.addEventListener(event, handleInteraction, { passive: true })
    })

    // Also listen for URL changes (filter/search changes)
    const handleURLChange = () => {
      const url = new URL(window.location.href)
      const hasSearchParams = url.searchParams.toString().length > 0
      
      if (hasSearchParams) {
        handleInteraction()
      }
    }

    // Check initial URL for search params
    handleURLChange()

    // Listen for URL changes
    window.addEventListener('popstate', handleURLChange)

    return () => {
      // Cleanup
      interactionEvents.forEach(event => {
        container.removeEventListener(event, handleInteraction)
      })
      window.removeEventListener('popstate', handleURLChange)
      
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [loadAlgoliaOnInteraction, hasAlgoliaConfig, hasUserInteracted])

  // Force database mode if no Algolia config
  if (!hasAlgoliaConfig) {
    return (
      <div ref={containerRef}>
        <ProductListing
          category_id={category_id}
          category_ids={category_ids}
          collection_id={collection_id}
          seller_id={seller_handle}
          categories={categories}
          currentCategory={currentCategory}
        />
      </div>
    )
  }

  // Show Algolia if user has interacted and we should load it
  if (shouldLoadAlgolia && hasUserInteracted) {
    return (
      <div ref={containerRef}>
        <AlgoliaProductsListing
          category_id={category_id}
          category_ids={category_ids}
          collection_id={collection_id}
          seller_handle={seller_handle}
          locale={locale}
          categories={categories}
          currentCategory={currentCategory}
        />
      </div>
    )
  }

  // Default: Show database listing with interaction detection
  return (
    <div ref={containerRef}>
      <ProductListing
        category_id={category_id}
        category_ids={category_ids}
        collection_id={collection_id}
        seller_id={seller_handle}
        categories={categories}
        currentCategory={currentCategory}
      />
      
      {/* Overlay hint for users to indicate enhanced search is available */}
      {loadAlgoliaOnInteraction && hasAlgoliaConfig && !hasUserInteracted && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm opacity-75 hover:opacity-100 transition-opacity">
          💡 Kliknij aby włączyć zaawansowane wyszukiwanie
        </div>
      )}
    </div>
  )
}
