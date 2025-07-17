'use client';

import {
  Accordion,
  FilterCheckboxOption,
} from '@/components/molecules';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRefinementList, useInstantSearch } from 'react-instantsearch';
import { useColorTaxonomy, ColorFamily } from '@/lib/data/colors';

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

export const ColorFilter = (): JSX.Element => {
  // Get refinement list for color_families
  const { items: algoliaFacetItems, refine } = useRefinementList({
    attribute: 'color_families',
    limit: 100,
    operator: 'or',
  });
  
  // Get instant search results for debugging
  const { results } = useInstantSearch();
  
  // Get all color families from database
  const { colorTaxonomy, isLoading, error } = useColorTaxonomy();
  
  // State for processed color filters
  const [colorFilters, setColorFilters] = useState<ColorFacetItem[]>([]);
  
  useEffect(() => {
    if (!colorTaxonomy || colorTaxonomy.length === 0) {
      setColorFilters([]);
      return;
    }
    
    // Create a map of Algolia facet data for quick lookup
    const algoliaFacetMap = new Map<string, { count: number; isRefined: boolean }>();
    
    algoliaFacetItems?.forEach(item => {
      algoliaFacetMap.set(item.value, {
        count: item.count,
        isRefined: item.isRefined
      });
    });
    
    // If no Algolia facets but we have products with color data, try to extract from results
    if (algoliaFacetItems.length === 0 && results) {
      const resultObj = results as any;
      if (resultObj.hits && resultObj.hits.length > 0) {
        const colorFamilyCount = new Map<string, number>();
        
        resultObj.hits.forEach((hit: any) => {
          if (hit.color_families && Array.isArray(hit.color_families)) {
            hit.color_families.forEach((family: string) => {
              colorFamilyCount.set(family, (colorFamilyCount.get(family) || 0) + 1);
            });
          }
        });
        
        // Add extracted data to algoliaFacetMap
        colorFamilyCount.forEach((count, family) => {
          algoliaFacetMap.set(family, { count, isRefined: false });
        });
      }
    }
    
    // Process all color families from database
    const processedItems: ColorFacetItem[] = colorTaxonomy.map(family => {
      // Look up this family in Algolia facets using the family name
      const algoliaData = algoliaFacetMap.get(family.name);
      
      const item: ColorFacetItem = {
        label: family.display_name,
        amount: algoliaData?.count || 0,
        colorStyle: createColorStyle(family.hex_base || '#d1d5db'),
        value: family.name, // This is the key for filtering
        tooltip: `${family.colors?.length || 0} kolorów w rodzinie ${family.display_name}`,
        isRefined: algoliaData?.isRefined || false
      };
      
      return item;
    });
    
    // Sort only by count (desc) and then by name, ignore refined status
    // This keeps colors in a consistent position regardless of selection state
    const sortedItems = processedItems.sort((a, b) => {
      if (a.amount !== b.amount) {
        return b.amount - a.amount;
      }
      return a.label.localeCompare(b.label);
    });
    
    setColorFilters(sortedItems);
    
  }, [colorTaxonomy, algoliaFacetItems, results]);
  
  // This function will toggle the selection state for a color family
  const handleSelect = (familyName: string): void => {
    // Use refine function from InstantSearch to toggle selection state
    // The refine function should handle both selection and deselection
    refine(familyName);
  };

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
                  'w-5 h-5 border border-gray-300 rounded-sm flex-shrink-0 ml-2',
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