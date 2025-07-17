// src/components/cells/SizeFilter/SizeFilter.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Chip } from "@/components/atoms"
import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useSearchParams } from "next/navigation"
import { useRefinementList, useInstantSearch } from "react-instantsearch"
import { useSizeAttributes } from "../../../hooks/useUniversalAttributes"

export const SizeFilter = () => {
  const { attributes: sizeAttributes, loading, error } = useSizeAttributes()
  const { results } = useInstantSearch()
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  
  // Auto-detect the primary size attribute (first one found)
  const primarySizeAttribute = useMemo(() => {
    return sizeAttributes.find(attr => attr.is_filterable) || sizeAttributes[0]
  }, [sizeAttributes])
  
  // Generate possible attribute paths for both product and variant levels
  const [attributePaths, setAttributePaths] = useState<string[]>([])  
  const [activePath, setActivePath] = useState<string | null>(null)
  
  // State for tracking current filter(s)
  const currentSizeFilters = useMemo(() => {
    const sizeParam = searchParams.get("size") || ""
    return sizeParam ? sizeParam.split(',') : []
  }, [searchParams])
  
  // Generate all possible paths Algolia might use for size attributes
  useEffect(() => {
    if (!primarySizeAttribute) return
    
    const possiblePaths = [
      // Variant-level attributes (prioritized since they're more specific)
      `variant_attribute_values.${primarySizeAttribute.handle}`,
      `variants.attribute_values.${primarySizeAttribute.handle}`,
      
      // Product-level attributes (fallback)
      `attribute_values.${primarySizeAttribute.handle}`,
      `attributes.${primarySizeAttribute.handle}`,
      
      // Known working paths from your existing setup
      `variant_attribute_values.RomiaryKlasyczne`,
      `attribute_values.RomiaryKlasyczne`,
      
      // Additional variant formats
      `variants.attribute_values.${primarySizeAttribute.handle.toLowerCase()}`,
      `variants.attribute_values.${primarySizeAttribute.handle.toUpperCase()}`,
      
      // Legacy formats
      `sizes`,
      `size`,
      `rozmiar`,
      `${primarySizeAttribute.handle.toLowerCase()}`
    ]
    
    setAttributePaths(possiblePaths)
  }, [primarySizeAttribute])

  // Use the active path or fallback to first available path
  const { items: sizeItems, refine } = useRefinementList({
    attribute: activePath || attributePaths[0] || 'variant_attribute_values.RomiaryKlasyczne', 
    limit: 100,
    operator: "or", // Use OR to allow multiple size selection
    sortBy: ['name']
  })
  
  // Find the working attribute path by testing facets and data structure
  useEffect(() => {
    if (!results || attributePaths.length === 0) return
    
    // Get available facets from Algolia
    const availableFacets = new Set<string>()
    
    // Check facets from results
    if (results.facets) {
      Object.keys(results.facets).forEach(facet => availableFacets.add(facet))
    }
    
    // Check disjunctive facets
    if (results.disjunctiveFacets) {
      results.disjunctiveFacets.forEach((facet: any) => {
        if (facet.name) availableFacets.add(facet.name)
      })
    }
    
    // Find the best matching path
    let bestPath = null
    let foundPaths: string[] = []
    
    // Method 1: Check available facets
    attributePaths.forEach(path => {
      if (availableFacets.has(path)) {
        foundPaths.push(path)
      }
    })
    
    // Method 2: Check product data structure for available attributes
    if (foundPaths.length === 0 && results.hits && results.hits.length > 0) {
      const sampleProduct = results.hits[0]
      
      // Check variant_attribute_values first (aggregated variant attributes)
      if (sampleProduct.variant_attribute_values) {
        Object.keys(sampleProduct.variant_attribute_values).forEach(key => {
          const testPath = `variant_attribute_values.${key}`
          if (attributePaths.includes(testPath)) {
            foundPaths.push(testPath)
          }
        })
      }
      
      // Check product attribute_values
      if (sampleProduct.attribute_values) {
        Object.keys(sampleProduct.attribute_values).forEach(key => {
          const testPath = `attribute_values.${key}`
          if (attributePaths.includes(testPath)) {
            foundPaths.push(testPath)
          }
        })
      }
      
      // Check individual variant attributes
      if (sampleProduct.variants && Array.isArray(sampleProduct.variants)) {
        sampleProduct.variants.forEach((variant: any) => {
          if (variant.attribute_values) {
            Object.keys(variant.attribute_values).forEach(key => {
              const testPath = `variants.attribute_values.${key}`
              if (attributePaths.includes(testPath)) {
                foundPaths.push(testPath)
              }
            })
          }
        })
      }
    }
    
    // Prioritize variant-level attributes over product-level
    if (foundPaths.length > 0) {
      // Look for variant_attribute_values first
      bestPath = foundPaths.find(path => path.startsWith('variant_attribute_values.')) ||
                 foundPaths.find(path => path.startsWith('variants.attribute_values.')) ||
                 foundPaths[0] // Fallback to first found path
      
      if (bestPath && bestPath !== activePath) {
        setActivePath(bestPath)
        console.log(`🔍 [SizeFilter] Using size attribute path: ${bestPath}`)
      }
    }
    
    // Log debug information
    console.log(`🔍 [SizeFilter] Debug info:`, {
      availableFacets: Array.from(availableFacets),
      foundPaths,
      bestPath,
      activePath,
      sampleProductStructure: results.hits?.[0] ? {
        hasVariantAttrs: !!results.hits[0].variant_attribute_values,
        hasProductAttrs: !!results.hits[0].attribute_values,
        variantAttrKeys: results.hits[0].variant_attribute_values ? Object.keys(results.hits[0].variant_attribute_values) : [],
        productAttrKeys: results.hits[0].attribute_values ? Object.keys(results.hits[0].attribute_values) : []
      } : null
    })
  }, [results, attributePaths, activePath, primarySizeAttribute])

  // Apply URL-based refinements to Algolia when URL params change
  useEffect(() => {
    if (!results || !activePath) return
    
    const helper = (results as any).helper
    if (!helper) return
    
    // Clear existing refinements for all possible paths
    attributePaths.forEach(path => {
      try {
        helper.clearRefinements(path)
      } catch (error) {
        // Ignore errors when clearing non-existent refinements
      }
    })
    
    // Apply current filters from URL using the active path
    if (currentSizeFilters.length > 0) {
      currentSizeFilters.forEach((size: string) => {
        try {
          helper.addFacetRefinement(activePath, size)
          console.log(`🔍 [SizeFilter] Applied size filter ${size} to path ${activePath}`)
        } catch (error) {
          console.error(`🔍 [SizeFilter] Failed to apply size filter ${size} to path ${activePath}:`, error)
        }
      })
    }
    
    helper.search()
  }, [activePath, currentSizeFilters, attributePaths])
  
  // Combine available sizes from multiple sources
  const allSizes = useMemo(() => {
    const sizeSet = new Set<string>()
    
    // Add sizes from Algolia facet items
    sizeItems.forEach((item: { label: string }) => {
      if (item.label) sizeSet.add(item.label)
    })
    
    // Add sizes from backend attribute data
    if (primarySizeAttribute?.possible_values) {
      primarySizeAttribute.possible_values.forEach(pv => {
        if (pv.value && typeof pv.value === 'string') {
          sizeSet.add(pv.value)
        }
      })
    }
    
    // Extract sizes from product hits
    if (results?.hits) {
      results.hits.forEach((product: any) => {
        // Check variant_attribute_values (aggregated)
        if (product.variant_attribute_values) {
          Object.values(product.variant_attribute_values).forEach((values: any) => {
            if (Array.isArray(values)) {
              values.forEach(value => {
                if (value && typeof value === 'string') sizeSet.add(value)
              })
            } else if (values && typeof values === 'string') {
              sizeSet.add(values)
            }
          })
        }
        
        // Check product attribute_values
        if (product.attribute_values) {
          Object.values(product.attribute_values).forEach((value: any) => {
            if (value && typeof value === 'string') sizeSet.add(value)
          })
        }
        
        // Check individual variant attributes
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((variant: any) => {
            if (variant.attribute_values) {
              Object.values(variant.attribute_values).forEach((value: any) => {
                if (value && typeof value === 'string') sizeSet.add(value)
              })
            }
          })
        }
      })
    }
    
    const allSizes = Array.from(sizeSet).sort()
    console.log(`🔍 [SizeFilter] Found ${allSizes.length} unique sizes:`, allSizes)
    return allSizes
  }, [sizeItems, primarySizeAttribute, results])
  
  // Check if a size filter is active
  const isFilterActive = (size: string): boolean => {
    return currentSizeFilters.includes(size)
  }
  
  // Handle size selection
  const handleSizeSelection = (size: string): void => {
    let newSizes: string[]
    
    if (currentSizeFilters.includes(size)) {
      // Remove if already selected
      newSizes = currentSizeFilters.filter((s: string) => s !== size)
    } else {
      // Add if not selected
      newSizes = [...currentSizeFilters, size]
    }
    
    // Update URL param
    const newSizeParam = newSizes.length > 0 ? newSizes.join(',') : null
    updateSearchParams('size', newSizeParam)
  }
  
  // Clear all size filters
  const clearSizeFilters = (): void => {
    updateSearchParams('size', null)
    
    // Clear Algolia refinements
    if (results) {
      const helper = (results as any).helper
      if (helper) {
        attributePaths.forEach(path => {
          try {
            helper.clearRefinements(path)
          } catch (error) {
            // Ignore errors
          }
        })
        helper.search()
      }
    }
  }
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 [SizeFilter] State:', {
      attributePaths,
      activePath,
      primarySizeAttribute: primarySizeAttribute?.handle,
      currentSizeFilters,
      allSizesCount: allSizes.length,
      sizeItemsCount: sizeItems.length
    })
  }, [attributePaths, activePath, primarySizeAttribute, currentSizeFilters, allSizes.length, sizeItems.length])

  if (loading) {
    return (
      <Accordion heading="Rozmiar">
        <p className="text-sm text-gray-500">Ładowanie...</p>
      </Accordion>
    )
  }

  if (error) {
    return (
      <Accordion heading="Rozmiar">
        <p className="text-sm text-gray-500">Błąd podczas ładowania danych o rozmiarach</p>
      </Accordion>
    )
  }

  if (sizeAttributes.length === 0 || allSizes.length === 0) {
    return null
  }

  return (
    <Accordion heading="Rozmiar">
      <div className="flex flex-wrap gap-2 mb-4">
        {allSizes.map((size) => (
          <Chip
            key={`size-${size}`}
            value={size}
            selected={isFilterActive(size)}
            onSelect={() => handleSizeSelection(size)}
          />
        ))}
      </div>
      
      {currentSizeFilters.length > 0 && (
        <button
          className="text-sm text-primary hover:text-primary-dark"
          onClick={clearSizeFilters}
        >
          Wyczyść filtry
        </button>
      )}
    </Accordion>
  )
}