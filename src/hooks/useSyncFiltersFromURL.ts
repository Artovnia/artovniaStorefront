import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'

/**
 * Hook to sync filter store state FROM URL params (URL is source of truth)
 * This ensures the store always reflects the current URL state
 * 
 * NOTE: Colors are NOT synced from URL because they use Algolia refinements
 * Color state is managed separately via refineColor callbacks
 */
export const useSyncFiltersFromURL = () => {
  const searchParams = useSearchParams()
  const { 
    setMinPrice, 
    setMaxPrice, 
    setSelectedSizes,
    setSelectedRating,
    setDimensionFilter,
    setPendingMinPrice,
    setPendingMaxPrice,
    setPendingSizes,
    setPendingRating,
    setPendingDimensionFilter,
    setSelectedColors,
    setPendingColors
  } = useFilterStore()

  useEffect(() => {
    // Sync price filters from URL
    const urlMinPrice = searchParams.get('min_price') || ''
    const urlMaxPrice = searchParams.get('max_price') || ''
    setMinPrice(urlMinPrice)
    setMaxPrice(urlMaxPrice)
    setPendingMinPrice(urlMinPrice)
    setPendingMaxPrice(urlMaxPrice)

    // Sync size filters from URL
    const urlSizes = searchParams.get('size')
    const sizesArray = urlSizes ? urlSizes.split(',') : []
    setSelectedSizes(sizesArray)
    setPendingSizes(sizesArray)

    // Sync rating filter from URL
    const urlRating = searchParams.get('rating') || null
    setSelectedRating(urlRating)
    setPendingRating(urlRating)

    // Sync dimension filters from URL
    const dimensionKeys = [
      'min_length', 'max_length',
      'min_width', 'max_width',
      'min_height', 'max_height',
      'min_weight', 'max_weight'
    ]
    
    dimensionKeys.forEach(key => {
      const value = searchParams.get(key) || ''
      setDimensionFilter(key, value)
      setPendingDimensionFilter(key, value)
    })
    
    // IMPORTANT: Clear colors when no color params in URL
    // Colors are managed via Algolia refinements, but we need to clear store when URL has no colors
    // This prevents ghost selections from persisted localStorage
    setSelectedColors([])
    setPendingColors([])
  }, [searchParams, setMinPrice, setMaxPrice, setSelectedSizes, setSelectedRating, setDimensionFilter, setPendingMinPrice, setPendingMaxPrice, setPendingSizes, setPendingRating, setPendingDimensionFilter, setSelectedColors, setPendingColors])
}
