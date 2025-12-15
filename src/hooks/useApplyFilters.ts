import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'

/**
 * Hook to batch apply all pending filters to URL params
 * This triggers a single Algolia search instead of multiple
 */
export const useApplyFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { applyPendingFilters, setIsEditingPrice } = useFilterStore()

  const applyFilters = useCallback(() => {
    // Get pending filter state
    const state = useFilterStore.getState()
    
    // Apply pending to active in store
    applyPendingFilters()
    
    // Reset editing flag to allow URL sync to work again
    setIsEditingPrice(false)
    
    // Build new URL params
    const params = new URLSearchParams(searchParams.toString())
    
    // Color filters
    if (state.pendingColors.length > 0) {
      // Colors are handled by Algolia refinements, not URL params
      // They sync through the ProductFilterBar component
    }
    
    // Price filters
    if (state.pendingMinPrice) {
      params.set('min_price', state.pendingMinPrice)
    } else {
      params.delete('min_price')
    }
    
    if (state.pendingMaxPrice) {
      params.set('max_price', state.pendingMaxPrice)
    } else {
      params.delete('max_price')
    }
    
    // Size filters
    if (state.pendingSizes.length > 0) {
      params.set('size', state.pendingSizes.join(','))
    } else {
      params.delete('size')
    }
    
    // Rating filter
    if (state.pendingRating) {
      params.set('rating', state.pendingRating)
    } else {
      params.delete('rating')
    }
    
    // Condition filter
    if (state.pendingCondition) {
      params.set('condition', state.pendingCondition)
    } else {
      params.delete('condition')
    }
    
    // Dimension filters
    const dimensionKeys = [
      'min_length', 'max_length',
      'min_width', 'max_width',
      'min_height', 'max_height',
      'min_weight', 'max_weight'
    ] as const
    
    dimensionKeys.forEach(key => {
      const value = state.pendingDimensionFilters[key]
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset to page 1 when filters change
    params.set('page', '1')
    
    // Update URL - this triggers a single Algolia search
    router.push(`?${params.toString()}`, { scroll: false })
  }, [applyPendingFilters, setIsEditingPrice, router, searchParams])

  return applyFilters
}
