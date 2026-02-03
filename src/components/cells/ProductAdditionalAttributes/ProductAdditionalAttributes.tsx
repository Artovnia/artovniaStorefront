"use client"

import { ProductPageAccordion } from "@/components/molecules"
import { AdditionalAttributeProps } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import "@/types/medusa" // Import extended types
import { useVariantSelection } from "@/components/context/VariantSelectionContext"
import { getVariantAttributes } from "@/lib/data/variant-attributes"

export const ProductAdditionalAttributes = ({
  product,
  initialAttributes
}: {
  product: HttpTypes.StoreProduct
  initialAttributes?: any[]
}) => {
  const { selectedVariantId } = useVariantSelection()
  
  // ✅ OPTIMIZATION: Track initial variant ID to prevent fetching server-prefetched data
  const initialVariantId = useRef(product.variants?.[0]?.id)
  
  // ✅ OPTIMIZATION: Use server-prefetched attributes if available
  const formattedInitialAttributes = initialAttributes?.map(attr => ({
    id: attr.id,
    value: attr.value,
    attribute_id: attr.attribute_id,
    attribute: {
      id: attr.attribute.id,
      name: attr.attribute.name
    }
  })) || []

  const [attributes, setAttributes] = useState<AdditionalAttributeProps[]>(formattedInitialAttributes)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Request deduplication cache - prevents multiple simultaneous requests
  const requestCacheRef = useRef(new Map<string, Promise<any>>())
  const lastFetchedRef = useRef<string>('')
  // ✅ FIX: Check if prop was passed (not if it has length) - empty array is valid server data
  const hasServerPrefetchedData = useRef(initialAttributes !== undefined)

  // Function to fetch variant attributes with request deduplication
  const fetchVariantAttributes = useCallback(async (productId: string, variantId: string) => {
    const cacheKey = `${productId}:${variantId}`
    
    // Prevent duplicate requests for the same variant
    if (lastFetchedRef.current === cacheKey) {
      return false
    }

    // Check if there's already a request in progress for this variant
    if (requestCacheRef.current.has(cacheKey)) {
      try {
        const cachedResult = await requestCacheRef.current.get(cacheKey)
        if (cachedResult) {
          setAttributes(cachedResult)
          return true
        }
      } catch (error) {
        // Remove failed request from cache
        requestCacheRef.current.delete(cacheKey)
      }
    }

    setIsLoading(true)
    lastFetchedRef.current = cacheKey

    // Create the request promise and cache it
    const requestPromise = (async () => {
      try {
        const response = await getVariantAttributes(productId, variantId)
        
        // Format the response to match our AdditionalAttributeProps type
        if (response && response.attribute_values && response.attribute_values.length > 0) {
          const formattedAttributes = response.attribute_values.map(attr => ({
            id: attr.id,
            value: attr.value,
            attribute_id: attr.attribute_id,
            attribute: {
              id: attr.attribute.id,
              name: attr.attribute.name
            }
          }))
          
          return formattedAttributes
        }
        return null
      } catch (error) {
        console.error('Error fetching variant attributes:', error)
        throw error
      }
    })()

    // Cache the request promise
    requestCacheRef.current.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      if (result) {
        setAttributes(result)
        return true
      }
      return false
    } catch (error) {
      console.error('Error fetching variant attributes:', error)
      return false
    } finally {
      setIsLoading(false)
      // Clean up the request cache after completion
      requestCacheRef.current.delete(cacheKey)
    }
  }, [])

  useEffect(() => {
    // ✅ OPTIMIZATION: Skip ALL fetches if we have server-prefetched data for initial variant
    // Even if the data is empty, it's valid - don't fetch again
    const isInitialVariant = selectedVariantId === initialVariantId.current
    if (isInitialVariant && hasServerPrefetchedData.current) {
      return
    }

    // If we have a selected variant, check local data immediately first
    if (selectedVariantId && product.id) {
      
      // 1. IMMEDIATE: Check if we have variant data locally and show it right away for a fast UI update
      const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId)
      
      if (selectedVariant?.attribute_values?.length) {

        setAttributes(selectedVariant.attribute_values)
      } else {
        setAttributes(product.attribute_values || [])
      }
      
      // 2. BACKGROUND: Then fetch from API to ensure we have the latest data
      // Only do the fetch if we don't already have variant attributes locally
      // to prevent unnecessary API calls
      if (!selectedVariant?.attribute_values?.length) {
        startTransition(async () => {
          await fetchVariantAttributes(product.id, selectedVariantId)
        })
      }
    } else {
      // Otherwise fall back to product attributes
      setAttributes(product.attribute_values || [])
    }
  }, [product.id, selectedVariantId, fetchVariantAttributes])
  
  if (!attributes.length) return null

  return (
    <ProductPageAccordion heading="Dodatkowe informacje" defaultOpen={false}>
      {isLoading && <div className="text-sm italic text-gray-500 p-2">Ładowanie atrybutów...</div>}
      {attributes.map((attribute) => (
        <div
          key={attribute.id}
          className="border rounded-sm grid grid-cols-2 text-center label-md"
        >
          <div className="border-r py-3">{attribute.attribute.name}</div>
          <div className="py-3">{attribute.value}</div>
        </div>
      ))}
    </ProductPageAccordion>
  )
}