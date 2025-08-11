import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FilterState {
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
      
      // Clear all filters
      clearAllFilters: () => set({
        selectedColors: [],
        minPrice: '',
        maxPrice: '',
        selectedSizes: [],
        selectedRating: null,
        selectedCondition: ''
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
