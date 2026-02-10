// src/lib/helpers/get-faced-filters.ts
import { FacetFilters } from "algoliasearch/lite"
import { ReadonlyURLSearchParams } from "next/navigation"

const getOption = (label: string) => {
  switch (label) {
    case "size":
      // Use variant attributes first, then fallback to product attributes
      // This should match the path that SizeFilter is using
      return "variant_attribute_values.RomiaryKlasyczne"
    case "color":
      return "color_families"
    case "condition":
      return "variants.condition"
    case "rating":
      return "average_rating"
    // Dimension filters - check both product and variant levels
    case "weight":
      return "weight"
    case "length":
      return "length"
    case "height":
      return "height"
    case "width":
      return "width"
    // Variant dimension filters
    case "variant_weight":
      return "variant_weights"
    case "variant_length":
      return "variant_lengths"
    case "variant_height":
      return "variant_heights"
    case "variant_width":
      return "variant_widths"
    default:
      return ""
  }
}

// Helper function to build size filters with fallback paths
const buildSizeFilter = (values: string[]): string => {
  const primaryPath = "variant_attribute_values.RomiaryKlasyczne"
  const fallbackPath = "attribute_values.RomiaryKlasyczne"
  
  // Create filter for both paths to ensure we catch all sizes
  const primaryFilters = values.map(val => `${primaryPath}:"${val}"`)
  const fallbackFilters = values.map(val => `${fallbackPath}:"${val}"`)
  
  if (values.length === 1) {
    // Single value - use OR between paths
    return `(${primaryPath}:"${values[0]}" OR ${fallbackPath}:"${values[0]}")`
  } else if (values.length > 1) {
    // Multiple values - OR within each path, then OR between paths
    const primaryOr = `(${primaryFilters.join(' OR ')})`
    const fallbackOr = `(${fallbackFilters.join(' OR ')})`
    return `(${primaryOr} OR ${fallbackOr})`
  }
  
  return ""
}

// Return type for filter results
export interface FilterResult {
  filters: string // Regular filter string for non-numeric attributes
  numericFilters: string[] // Numeric filters for price, dimensions, etc.
}

export const getFacedFilters = (filters: ReadonlyURLSearchParams): FilterResult => {
  const filterParts: string[] = []
  const numericFilterParts: string[] = []
  let minPrice = null
  let maxPrice = null

  // For dimension filters - handle min/max ranges
  const dimensionFilters: Record<string, {min?: string, max?: string}> = {
    length: {},
    width: {},
    height: {},
    weight: {}
  }

  // Process each filter from URL params
  for (const [key, value] of filters.entries()) {
    // Handle dimension range filters
    if (key.startsWith('min_') || key.startsWith('max_')) {
      const isMin = key.startsWith('min_')
      const dimensionType = key.replace(/^(min|max)_/, '')
      
      if (['length', 'width', 'height', 'weight'].includes(dimensionType)) {
        const rangeType = isMin ? 'min' : 'max'
        if (!dimensionFilters[dimensionType]) {
          dimensionFilters[dimensionType] = {}
        }
        dimensionFilters[dimensionType][rangeType] = value
        continue
      }
    }
    
    // Skip processing certain parameters that aren't actual filters
    if (
      key !== "min_price" &&
      key !== "max_price" &&
      key !== "sale" &&
      key !== "query" &&
      key !== "page" &&
      key !== "products[page]" &&
      key !== "sortBy" &&
      key !== "rating"
    ) {
      const fieldName = getOption(key)
      
      if (fieldName) {
        const splittedValues = value.split(",")
        
        // Special handling for size filters
        if (key === "size") {
          const sizeFilter = buildSizeFilter(splittedValues)
          if (sizeFilter) {
            filterParts.push(sizeFilter)
          }
        } else {
          // Handle other filters normally
          if (splittedValues.length > 1) {
            const orConditions = splittedValues.map(val => `${fieldName}:"${val}"`)
            filterParts.push(`(${orConditions.join(' OR ')})`)
          } else {
            filterParts.push(`${fieldName}:"${splittedValues[0]}"`)
          }
        }
      }
    } else {
      // Handle special filters
      if (key === "min_price") minPrice = value
      if (key === "max_price") maxPrice = value

      // NOTE: Rating filter is NOT parsed here anymore.
      // Rating is applied directly through Configure's facetFiltersList via Zustand store
      // (selectedRating → facetFiltersList in AlgoliaProductsListingWithConfig).
      // The URL 'rating' param is still set by useApplyFilters and synced to Zustand
      // by useSyncFiltersFromURL, but parsing it here would create a duplicate filter.
    }
  }
  
  // Process dimension filters
  for (const [dimension, ranges] of Object.entries(dimensionFilters)) {
    if (ranges.min || ranges.max) {
      const dimensionField = getOption(dimension)
      const variantDimensionField = getOption(`variant_${dimension}`)
      
      if (dimensionField) {
        let dimensionFilter = ""
        
        if (ranges.min && ranges.max) {
          dimensionFilter = `${dimensionField}:${ranges.min} TO ${ranges.max}`
        } else if (ranges.min) {
          dimensionFilter = `${dimensionField} >= ${ranges.min}`
        } else if (ranges.max) {
          dimensionFilter = `${dimensionField} <= ${ranges.max}`
        }
        
        // Also check variant dimensions if available
        if (variantDimensionField && dimensionFilter) {
          let variantDimensionFilter = ""
          
          if (ranges.min && ranges.max) {
            variantDimensionFilter = `${variantDimensionField}:${ranges.min} TO ${ranges.max}`
          } else if (ranges.min) {
            variantDimensionFilter = `${variantDimensionField} >= ${ranges.min}`
          } else if (ranges.max) {
            variantDimensionFilter = `${variantDimensionField} <= ${ranges.max}`
          }
          
          // Use OR to match either product or variant dimensions
          filterParts.push(`(${dimensionFilter} OR ${variantDimensionFilter})`)
        } else {
          filterParts.push(dimensionFilter)
        }
      }
    }
  }

  // CRITICAL FIX: Add price filter to numericFilters (not filters string)
  // This prevents "attribute not specified in numericAttributesForFiltering" errors
  // numericFilters work correctly with replica indices and sorting
  // Using min_price which is simpler and definitely configured in all indices
  if (minPrice || maxPrice) {
    if (minPrice && maxPrice) {
      // Filter by min_price range - products where min_price is within range
      numericFilterParts.push(`min_price >= ${minPrice}`)
      numericFilterParts.push(`min_price <= ${maxPrice}`)
    } else if (minPrice) {
      numericFilterParts.push(`min_price >= ${minPrice}`)
    } else if (maxPrice) {
      numericFilterParts.push(`min_price <= ${maxPrice}`)
    }
  }

  return {
    filters: filterParts.length > 0 ? filterParts.join(' AND ') : '',
    numericFilters: numericFilterParts
  }
}