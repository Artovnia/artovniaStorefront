'use client';

import {
  Accordion,
  FilterCheckboxOption,
} from '@/components/molecules';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRefinementList } from 'react-instantsearch';
import { useColorTaxonomy, ColorFamily } from '@/lib/data/colors';
import { useFilterStore } from '@/stores/filterStore';

// Utility function to create inline style for hex colors
const createColorStyle = (hex: string): React.CSSProperties => {
  if (hex && !hex.startsWith('#')) {
    hex = '#' + hex;
  }
  
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex || '')) {
    return { backgroundColor: '#d1d5db' };
  }
  
  return { backgroundColor: hex };
};

export interface ColorFacetItem {
  label: string;
  amount: number;
  colorStyle: React.CSSProperties;
  value: string; // family name for filtering
  tooltip: string;
  isRefined: boolean;
}

interface ColorFilterProps {
  algoliaFacetItems?: Array<{
    value: string;
    count: number;
    isRefined: boolean;
  }>;
  onClose?: () => void;
  showButton?: boolean;
}

export const ColorFilter = ({ algoliaFacetItems = [], onClose, showButton = true }: ColorFilterProps): JSX.Element => {
  // Get all color families from database
  const { colorTaxonomy, isLoading, error } = useColorTaxonomy();
  
  // Zustand store for persistent color selection (UI-only)
  const { selectedColors, addColor, removeColor } = useFilterStore();
  
  // State for processed color filters
  const [colorFilters, setColorFilters] = useState<ColorFacetItem[]>([]);
  
  // Memoize the Algolia facet map to prevent unnecessary recalculations
  const algoliaFacetMap = useMemo(() => {
    const map = new Map<string, { count: number; isRefined: boolean }>();
    algoliaFacetItems?.forEach(item => {
      map.set(item.value, {
        count: item.count,
        isRefined: item.isRefined
      });
    });
    return map;
  }, [algoliaFacetItems]);

  // Memoize the processed color filters to prevent unnecessary recalculations
  const processedColorFilters = useMemo(() => {
    if (!colorTaxonomy || colorTaxonomy.length === 0) {
      return [];
    }
    
    // Process all color families from database with Algolia data
    const processedItems: ColorFacetItem[] = colorTaxonomy.map(family => {
      // Look up this family in Algolia facets using the family name
      const algoliaData = algoliaFacetMap.get(family.name);
      
      // Use Zustand store for UI state (persistent across dropdown open/close)
      const isRefined = selectedColors.includes(family.name);
      
      const item: ColorFacetItem = {
        label: family.display_name,
        amount: algoliaData?.count || 0, // Get count from Algolia
        colorStyle: createColorStyle(family.hex_base || '#d1d5db'),
        value: family.name, // This is the key for filtering
        tooltip: `${family.colors?.length || 0} kolorów w rodzinie ${family.display_name}`,
        isRefined: isRefined // Use Zustand store state for UI
      };
      
      return item;
    });
    
    // Sort by count (desc) and then by name for consistent ordering
    return processedItems.sort((a, b) => {
      if (a.amount !== b.amount) {
        return b.amount - a.amount;
      }
      return a.label.localeCompare(b.label);
    });
  }, [colorTaxonomy, selectedColors, algoliaFacetMap]);

  // Update state only when processed filters change
  useEffect(() => {
    setColorFilters(processedColorFilters);
  }, [processedColorFilters]);
  
  // Memoize the handleSelect function to prevent unnecessary re-renders
  const handleSelect = useCallback((familyName: string): void => {
    if (selectedColors.includes(familyName)) {
      removeColor(familyName);
    } else {
      addColor(familyName);
    }
  }, [selectedColors, removeColor, addColor]);





  // Show loading state
  if (isLoading && colorFilters.length === 0) {
    return (
      <Accordion heading='Kolor'>
        <div className="px-4 py-2 text-sm text-gray-500">Ładowanie kolorów...</div>
      </Accordion>
    );
  }

  // Show error state if there's an error loading taxonomy
  if (error && colorFilters.length === 0) {
    return (
      <Accordion heading='Kolor'>
        <div className="px-4 py-2 text-sm text-red-500">Błąd ładowania kolorów: {error.message}</div>
      </Accordion>
    );
  }

  return (
    <Accordion heading='Kolor'>
      <ul className='px-4'>
        {colorFilters.length > 0 ? (
          colorFilters.map(({ label, amount, colorStyle, value, tooltip, isRefined }) => (
            <li
              key={value}
              className='mb-4 flex items-center justify-between'
            >
              <FilterCheckboxOption
                checked={isRefined}
                disabled={amount === 0}
                onCheck={handleSelect}
                label={label}
                amount={amount}
                value={value} // Family name for filtering
              />
              <div
                className={cn(
                  'w-5 h-5 border border-gray-300 rounded-full flex-shrink-0 ml-2',
                  amount === 0 && 'opacity-30'
                )}
                style={colorStyle}
                title={tooltip}
              />
            </li>
          ))
        ) : (
          <li className="px-2 py-1 text-sm text-gray-500">
            Brak dostępnych filtrów koloru
          </li>
        )}
      </ul>
      
     
    </Accordion>
  );
};