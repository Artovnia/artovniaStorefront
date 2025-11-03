import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
  // APPLIED FILTERS (active in URL and Algolia)
  // Color filters
  selectedColors: string[]
  setSelectedColors: (colors: string[]) => void
  addColor: (color: string) => void
  removeColor: (color: string) => void
  clearColors: () => void
  
  // Price filters
  minPrice: string
  maxPrice: string
  setMinPrice: (price: string) => void
  setMaxPrice: (price: string) => void
  clearPriceRange: () => void
  
  // Size filters
  selectedSizes: string[]
  setSelectedSizes: (sizes: string[]) => void
  addSize: (size: string) => void
  removeSize: (size: string) => void
  clearSizes: () => void
  
  // Rating filter
  selectedRating: string | null
  setSelectedRating: (rating: string | null) => void
  clearRating: () => void
  
  // Condition filter
  selectedCondition: string | null
  setSelectedCondition: (condition: string | null) => void
  clearCondition: () => void
  
  // Dimension filters
  dimensionFilters: {
    min_length: string
    max_length: string
    min_width: string
    max_width: string
    min_height: string
    max_height: string
    min_weight: string
    max_weight: string
  }
  setDimensionFilter: (key: string, value: string) => void
  clearDimensionFilters: () => void
  
  // PENDING FILTERS (staged, not yet applied)
  pendingColors: string[]
  setPendingColors: (colors: string[]) => void
  addPendingColor: (color: string) => void
  removePendingColor: (color: string) => void
  
  pendingMinPrice: string
  pendingMaxPrice: string
  setPendingMinPrice: (price: string) => void
  setPendingMaxPrice: (price: string) => void
  
  pendingSizes: string[]
  setPendingSizes: (sizes: string[]) => void
  addPendingSize: (size: string) => void
  removePendingSize: (size: string) => void
  
  pendingRating: string | null
  setPendingRating: (rating: string | null) => void
  
  pendingCondition: string | null
  setPendingCondition: (condition: string | null) => void
  
  pendingDimensionFilters: {
    min_length: string
    max_length: string
    min_width: string
    max_width: string
    min_height: string
    max_height: string
    min_weight: string
    max_weight: string
  }
  setPendingDimensionFilter: (key: string, value: string) => void
  
  // Apply pending filters (move pending to active)
  applyPendingFilters: () => void
  
  // Reset pending filters to match active filters (cancel changes)
  resetPendingFilters: () => void
  
  // Clear all filters
  clearAllFilters: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Color filters
      selectedColors: [],
      setSelectedColors: (colors) => set({ selectedColors: colors }),
      addColor: (color) => set((state) => ({
        selectedColors: state.selectedColors.includes(color) 
          ? state.selectedColors 
          : [...state.selectedColors, color]
      })),
      removeColor: (color) => set((state) => ({
        selectedColors: state.selectedColors.filter(c => c !== color)
      })),
      clearColors: () => set({ selectedColors: [] }),
      
      // Price filters
      minPrice: '',
      maxPrice: '',
      setMinPrice: (price) => set({ minPrice: price }),
      setMaxPrice: (price) => set({ maxPrice: price }),
      clearPriceRange: () => set({ minPrice: '', maxPrice: '' }),
      
      // Size filters
      selectedSizes: [],
      setSelectedSizes: (sizes) => set({ selectedSizes: sizes }),
      addSize: (size) => set((state) => ({
        selectedSizes: state.selectedSizes.includes(size)
          ? state.selectedSizes
          : [...state.selectedSizes, size]
      })),
      removeSize: (size) => set((state) => ({
        selectedSizes: state.selectedSizes.filter(s => s !== size)
      })),
      clearSizes: () => set({ selectedSizes: [] }),
      
      // Rating filter
      selectedRating: null,
      setSelectedRating: (rating) => set({ selectedRating: rating }),
      clearRating: () => set({ selectedRating: null }),
      
      // Condition filter
      selectedCondition: '',
      setSelectedCondition: (condition) => set({ selectedCondition: condition }),
      clearCondition: () => set({ selectedCondition: '' }),
      
      // Dimension filters
      dimensionFilters: {
        min_length: '',
        max_length: '',
        min_width: '',
        max_width: '',
        min_height: '',
        max_height: '',
        min_weight: '',
        max_weight: ''
      },
      setDimensionFilter: (key, value) => set((state) => ({
        dimensionFilters: {
          ...state.dimensionFilters,
          [key]: value
        }
      })),
      clearDimensionFilters: () => set({
        dimensionFilters: {
          min_length: '',
          max_length: '',
          min_width: '',
          max_width: '',
          min_height: '',
          max_height: '',
          min_weight: '',
          max_weight: ''
        }
      }),
      
      // PENDING FILTERS (staged, not yet applied)
      pendingColors: [],
      setPendingColors: (colors) => set({ pendingColors: colors }),
      addPendingColor: (color) => set((state) => ({
        pendingColors: state.pendingColors.includes(color)
          ? state.pendingColors
          : [...state.pendingColors, color]
      })),
      removePendingColor: (color) => set((state) => ({
        pendingColors: state.pendingColors.filter(c => c !== color)
      })),
      
      pendingMinPrice: '',
      pendingMaxPrice: '',
      setPendingMinPrice: (price) => set({ pendingMinPrice: price }),
      setPendingMaxPrice: (price) => set({ pendingMaxPrice: price }),
      
      pendingSizes: [],
      setPendingSizes: (sizes) => set({ pendingSizes: sizes }),
      addPendingSize: (size) => set((state) => ({
        pendingSizes: state.pendingSizes.includes(size)
          ? state.pendingSizes
          : [...state.pendingSizes, size]
      })),
      removePendingSize: (size) => set((state) => ({
        pendingSizes: state.pendingSizes.filter(s => s !== size)
      })),
      
      pendingRating: null,
      setPendingRating: (rating) => set({ pendingRating: rating }),
      
      pendingCondition: null,
      setPendingCondition: (condition) => set({ pendingCondition: condition }),
      
      pendingDimensionFilters: {
        min_length: '',
        max_length: '',
        min_width: '',
        max_width: '',
        min_height: '',
        max_height: '',
        min_weight: '',
        max_weight: ''
      },
      setPendingDimensionFilter: (key, value) => set((state) => ({
        pendingDimensionFilters: {
          ...state.pendingDimensionFilters,
          [key]: value
        }
      })),
      
      // Apply pending filters (move pending to active)
      applyPendingFilters: () => set((state) => ({
        selectedColors: [...state.pendingColors],
        minPrice: state.pendingMinPrice,
        maxPrice: state.pendingMaxPrice,
        selectedSizes: [...state.pendingSizes],
        selectedRating: state.pendingRating,
        selectedCondition: state.pendingCondition,
        dimensionFilters: { ...state.pendingDimensionFilters }
      })),
      
      // Reset pending filters to match active filters (cancel changes)
      resetPendingFilters: () => set((state) => ({
        pendingColors: [...state.selectedColors],
        pendingMinPrice: state.minPrice,
        pendingMaxPrice: state.maxPrice,
        pendingSizes: [...state.selectedSizes],
        pendingRating: state.selectedRating,
        pendingCondition: state.selectedCondition,
        pendingDimensionFilters: { ...state.dimensionFilters }
      })),
      
      // Clear all filters
      clearAllFilters: () => set({
        selectedColors: [],
        minPrice: '',
        maxPrice: '',
        selectedSizes: [],
        selectedRating: null,
        selectedCondition: '',
        dimensionFilters: {
          min_length: '',
          max_length: '',
          min_width: '',
          max_width: '',
          min_height: '',
          max_height: '',
          min_weight: '',
          max_weight: ''
        },
        pendingColors: [],
        pendingMinPrice: '',
        pendingMaxPrice: '',
        pendingSizes: [],
        pendingRating: null,
        pendingCondition: null,
        pendingDimensionFilters: {
          min_length: '',
          max_length: '',
          min_width: '',
          max_width: '',
          min_height: '',
          max_height: '',
          min_weight: '',
          max_weight: ''
        }
      })
    }),
    {
      name: 'filter-store', // unique name for localStorage key
      // Only persist essential filter state
      partialize: (state) => ({
        selectedColors: state.selectedColors,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        selectedSizes: state.selectedSizes,
        selectedRating: state.selectedRating,
        selectedCondition: state.selectedCondition,
      }),
    }
  )
)
