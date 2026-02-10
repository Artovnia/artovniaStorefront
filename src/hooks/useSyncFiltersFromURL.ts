import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'

/**
 * Hook to sync filter store state FROM URL params (URL is source of truth)
 * This ensures the store always reflects the current URL state
 * 
 * NOTE: Colors are NOT synced from URL because they are managed via Zustand store
 * and applied through Configure's facetFiltersList in AlgoliaProductsListingWithConfig
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
    setPendingColors,
    isEditingPrice
  } = useFilterStore()

  useEffect(() => {
    const urlMinPrice = searchParams.get('min_price') || ''
    const urlMaxPrice = searchParams.get('max_price') || ''
    
   
   // Sync price filters from URL - SKIP if user is actively editing
if (!isEditingPrice) {
  setMinPrice(urlMinPrice)
  setMaxPrice(urlMaxPrice)
  setPendingMinPrice(urlMinPrice)
  setPendingMaxPrice(urlMaxPrice)
}

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
    
    // CRITICAL FIX: DO NOT clear colors automatically
    // Colors are managed via Algolia refinements and should persist across pagination
    // They will be cleared explicitly when user clicks "Clear All" or removes individual colors
    // Automatic clearing was causing colors to disappear when changing pages
  }, [searchParams, setMinPrice, setMaxPrice, setSelectedSizes, setSelectedRating, setDimensionFilter, setPendingMinPrice, setPendingMaxPrice, setPendingSizes, setPendingRating, setPendingDimensionFilter, setSelectedColors, setPendingColors, isEditingPrice])
}
