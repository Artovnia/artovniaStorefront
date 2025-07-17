"use client"

import { ProductPageAccordion } from "@/components/molecules"
import { AdditionalAttributeProps } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState, useTransition } from "react"
import "@/types/medusa" // Import extended types
import { useVariantSelection } from "@/components/context/VariantSelectionContext"
import { getVariantAttributes } from "@/lib/data/variant-attributes"

export const ProductAdditionalAttributes = ({
  product
}: {
  product: HttpTypes.StoreProduct
}) => {
  const [attributes, setAttributes] = useState<AdditionalAttributeProps[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { selectedVariantId } = useVariantSelection()

  // Function to fetch variant attributes from the API
  async function fetchVariantAttributes(productId: string, variantId: string) {
    setIsLoading(true)
    try {
      const response = await getVariantAttributes(productId, variantId)
      
      // Format the response to match our AdditionalAttributeProps type
      if (response.attribute_values?.length > 0) {
        const formattedAttributes = response.attribute_values.map(attr => ({
          id: attr.id,
          value: attr.value,
          attribute_id: attr.attribute_id,
          attribute: {
            id: attr.attribute.id,
            name: attr.attribute.name
          }
        }))
        
        console.log('Fetched variant attributes from API:', formattedAttributes)
        setAttributes(formattedAttributes)
        return true
      }
      return false
    } catch (error) {
      console.error('Error fetching variant attributes:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('ProductAdditionalAttributes effect running with:', { 
      selectedVariantId, 
      productId: product.id,
      productHasAttrs: !!product.attribute_values?.length,
      variantsCount: product.variants?.length || 0
    })

    // If we have a selected variant, check local data immediately first
    if (selectedVariantId && product.id) {
      // 1. IMMEDIATE: Check if we have variant data locally and show it right away for a fast UI update
      const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId)
      
      if (selectedVariant?.attribute_values?.length) {
        console.log('IMMEDIATE: Using variant attributes from local data:', selectedVariant.attribute_values)
        setAttributes(selectedVariant.attribute_values)
      } else {
        console.log('IMMEDIATE: No local variant attributes, using product attributes for now')
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
      console.log('Using product attributes:', product.attribute_values)
      setAttributes(product.attribute_values || [])
    }
  }, [product, selectedVariantId])
  
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