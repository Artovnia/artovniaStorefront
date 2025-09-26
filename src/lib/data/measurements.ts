"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { SingleProductMeasurement } from "@/types/product"
import { getCachedMeasurements } from "../utils/unified-cache"

/**
 * Gets a product and its variants by ID with all measurements included
 */
async function getProductWithMeasurements(productId: string) {
  try {
    const authHeaders = await getAuthHeaders()
    
    // Set timeout for slow API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 seconds
    
    try {
      const response = await sdk.client.fetch<{
        product: {
          id: string
          weight?: number | null
          length?: number | null
          height?: number | null
          width?: number | null
          variants: Array<{
            id: string
            weight?: number | null
            length?: number | null
            height?: number | null
            width?: number | null
          }>
        }
      }>(`/store/products/${productId}`, {
        method: "GET",
        headers: authHeaders,
        query: {
          fields: "id,weight,length,height,width,variants.id,variants.weight,variants.length,variants.height,variants.width"
        },
        signal: controller.signal,
        cache: 'force-cache', // Use Vercel edge caching
        next: { revalidate: 600 } // 10 minutes
      })
      
      clearTimeout(timeoutId)
      return response.product
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
    
  } catch (error) {
    console.error(`Error fetching measurements for ${productId}:`, error)
    return null
  }
}

// Translations for dimension labels
const dimensionLabels = {
  en: {
    length: 'Length',
    width: 'Width',
    height: 'Height',
    weight: 'Weight'
  },
  pl: {
    length: 'Długość',
    width: 'Szerokość',
    height: 'Wysokość',
    weight: 'Waga'
  }
}

/**
 * Format a measurement value
 */
function formatMeasurement(
  value: number | null | undefined, 
  key: string, 
  label: string, 
  locale: string = 'en'
): SingleProductMeasurement | null {
  if (value === null || value === undefined) return null
  
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
  if (isNaN(numValue)) return null
  
  try {
    if (key === 'weight') {
      return {
        label,
        value: numValue.toFixed(2),
        unit: 'kg'
      }
    } else {
      return {
        label,
        cm: numValue.toFixed(1),
        inches: (numValue / 2.54).toFixed(1)
      }
    }
  } catch (error) {
    console.error(`Error formatting measurement for ${label}:`, value, error)
    return null
  }
}

/**
 * Get measurements from a product and all its variants
 * Optimized with caching and Vercel edge functions
 */
export const getProductMeasurements = async (
  productId: string,
  selectedVariantId?: string,
  locale: string = 'en'
): Promise<SingleProductMeasurement[]> => {
  
  // Use unified cache for this operation
  return getCachedMeasurements(
    productId,
    selectedVariantId,
    locale,
    async () => {
      try {
        const product = await getProductWithMeasurements(productId)
        if (!product) {
          console.error(`Could not find product ${productId}`)
          return []
        }

        const labels = dimensionLabels[locale as keyof typeof dimensionLabels] || dimensionLabels.en
        const physicalDimensions = ['length', 'width', 'height']
        const specialDimensions = ['weight']
        const dimensionKeys = [...physicalDimensions, ...specialDimensions]
        
        const productLevelMeasurements: SingleProductMeasurement[] = []
        const variantMeasurementsMap: Record<string, SingleProductMeasurement[]> = {}
        
        // Collect product-level measurements
        dimensionKeys.forEach(key => {
          const value = product ? (product as any)[key] : undefined
          const label = labels[key as keyof typeof labels]
          
          const measurement = formatMeasurement(value, key, label, locale)
          if (measurement) {
            productLevelMeasurements.push(measurement)
          }
        })
        
        // Collect variant-level measurements
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach(variant => {
            const variantId = variant.id
            variantMeasurementsMap[variantId] = []
            
            dimensionKeys.forEach(key => {
              const value = (variant as any)[key]
              const label = labels[key as keyof typeof labels]
              
              if (value !== null && value !== undefined) {
                const measurement = formatMeasurement(value, key, label, locale)
                if (measurement) {
                  measurement.variantId = variantId
                  variantMeasurementsMap[variantId].push(measurement)
                }
              }
            })
          })
        }
        
        // If we have a selected variant, return its measurements + product fallbacks
        if (selectedVariantId) {
          const selectedVariantMeasurements = variantMeasurementsMap[selectedVariantId] || []
          
          // Find which product-level measurements to include as fallbacks
          const variantDimensionLabels = selectedVariantMeasurements.map(m => m.label)
          const productFallbacks = productLevelMeasurements.filter(m => {
            const dimensionKey = Object.keys(labels).find(key => labels[key as keyof typeof labels] === m.label)
            const isPhysicalDimension = dimensionKey && physicalDimensions.includes(dimensionKey)
            
            return isPhysicalDimension && !variantDimensionLabels.includes(m.label)
          })
          
          return [...selectedVariantMeasurements, ...productFallbacks]
        }
        
        return productLevelMeasurements
        
      } catch (error) {
        console.error(`Error getting measurements for product ${productId}:`, error)
        return []
      }
    }
  )
}