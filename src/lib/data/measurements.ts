"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { SingleProductMeasurement } from "@/types/product"
import { measurementDeduplicator, performanceMonitor } from "../utils/performance"

/**
 * Gets a product and its variants by ID with all measurements included
 * Uses request deduplication to prevent multiple identical API calls
 */
async function getProductWithMeasurements(productId: string) {
  const cacheKey = `product-measurements-${productId}`;
  
  return measurementDeduplicator.dedupe(
    cacheKey,
    async () => {
      try {
        const headers = {
          ...(await getAuthHeaders()),
        }

        // Fetch product with all measurement fields
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
          headers,
          query: {
            fields: "id,weight,length,height,width,variants.id,variants.weight,variants.length,variants.height,variants.width"
          },
          next: {
            revalidate: 3600, // Cache for 1 hour
            tags: ['product-measurements', `product-${productId}`],
          }
        })

        return response.product
      } catch (error) {
        console.error(`Error fetching product with measurements for product ${productId}:`, error)
        return null
      }
    },
    {
      useCache: true
    }
  );
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
 * Format a measurement value based on its type (weight or dimension)
 */
function formatMeasurement(
  value: number | null | undefined, 
  key: string, 
  label: string, 
  locale: string = 'en'
): SingleProductMeasurement | null {
  // First ensure we have a valid number
  if (value === null || value === undefined) {
    return null
  }
  
  // Make sure it's actually a number type
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
  
  if (isNaN(numValue)) {
    return null
  }
  
  try {
    // Handle weight differently than dimensions
    if (key === 'weight') {
      return {
        label,
        value: numValue.toFixed(2),
        unit: 'kg'
      }
    } else {
      // Handle dimensions (length, width, height)
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
 * Optimized with caching and deduplication to prevent multiple API calls
 */
export const getProductMeasurements = async (
  productId: string,
  selectedVariantId?: string,
  locale: string = 'en'
): Promise<SingleProductMeasurement[]> => {
  const measureRender = performanceMonitor.measureRender('getProductMeasurements');
  const cacheKey = `measurements-${productId}-${selectedVariantId || 'no-variant'}-${locale}`;
  
  // Check if we have cached measurements first
  const cached = measurementDeduplicator.getCached<SingleProductMeasurement[]>(cacheKey);
  if (cached) {
    measureRender();
    return cached;
  }
  
  try {
    // Fetch the product with all measurement fields (uses deduplication)
    const product = await getProductWithMeasurements(productId)
    if (!product) {
      console.error(`Could not find product ${productId}`)
      const emptyResult: SingleProductMeasurement[] = [];
      measureRender();
      return emptyResult;
    }
    
    // Get the translated labels based on locale
    const labels = dimensionLabels[locale as keyof typeof dimensionLabels] || dimensionLabels.en
    
    // Define dimension categories
    const physicalDimensions = ['length', 'width', 'height'] // These can fall back to product level
    const specialDimensions = ['weight'] // These should only show if explicitly defined on the variant
    
    // Get all dimension keys
    const dimensionKeys = [...physicalDimensions, ...specialDimensions]
    
    // Create separate collections to track measurements by source
    const productLevelMeasurements: SingleProductMeasurement[] = [];
    const variantMeasurementsMap: Record<string, SingleProductMeasurement[]> = {};
    
    // 1. First collect all product-level measurements
    dimensionKeys.forEach(key => {
      const value = product ? (product as any)[key] : undefined;
      const label = labels[key as keyof typeof labels];
      
      const measurement = formatMeasurement(value, key, label, locale);
      if (measurement) {
        productLevelMeasurements.push(measurement);
      }
    });
    
    // 2. Then collect all variant-level measurements, organized by variant ID
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        const variantId = variant.id;
        variantMeasurementsMap[variantId] = [];
        
        dimensionKeys.forEach(key => {
          const value = (variant as any)[key];
          const label = labels[key as keyof typeof labels];
          
          // Only add variant measurements if they exist
          if (value !== null && value !== undefined) {
            const measurement = formatMeasurement(value, key, label, locale);
            if (measurement) {
              measurement.variantId = variantId;
              variantMeasurementsMap[variantId].push(measurement);
            }
          }
        });
      });
    }
    
    // 3. If we have a selected variant, return its measurements + product fallbacks
    if (selectedVariantId) {
      // Get the measurements for the selected variant
      const selectedVariantMeasurements = variantMeasurementsMap[selectedVariantId] || [];
      
      // Find which product-level measurements we need to include as fallbacks
      // (only physical dimensions not already covered by the variant)
      const variantDimensionLabels = selectedVariantMeasurements.map(m => m.label);
      const productFallbacks = productLevelMeasurements.filter(m => {
        // Only include product-level fallbacks for physical dimensions, not special ones like weight
        const dimensionKey = Object.keys(labels).find(key => labels[key as keyof typeof labels] === m.label);
        const isPhysicalDimension = dimensionKey && physicalDimensions.includes(dimensionKey);
        
        return isPhysicalDimension && !variantDimensionLabels.includes(m.label);
      });
      
      // Combine variant measurements with product fallbacks
      const result = [...selectedVariantMeasurements, ...productFallbacks];
      
      // Cache the result for future requests
      measurementDeduplicator.dedupe(
        cacheKey,
        async () => result,
        { useCache: true }
      );
      
      measureRender();
      return result;
    }
    
    // Cache the result for future requests
    measurementDeduplicator.dedupe(
      cacheKey,
      async () => productLevelMeasurements,
      { useCache: true }
    );
    
    measureRender();
    return productLevelMeasurements;
    
  } catch (error) {
    console.error(`Error getting measurements for product ${productId}:`, error)
    const emptyResult: SingleProductMeasurement[] = [];
    measureRender();
    return emptyResult;
  }
}