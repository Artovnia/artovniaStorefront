'use client';

import {
  Accordion,
  FilterCheckboxOption,
} from '@/components/molecules';
import { StarRating } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/stores/filterStore';
import { useEffect } from 'react';

interface ProductRatingFilterProps {
  algoliaRatingItems?: Array<{
    label: string;
    count: number;
    isRefined: boolean;
  }>;
  onClose?: () => void;
  showButton?: boolean;
}

export const ProductRatingFilter = ({ algoliaRatingItems = [], onClose, showButton = true }: ProductRatingFilterProps) => {
  // Use PENDING state for staging selections (not applied until Apply button)
  // URL sync is handled by useSyncFiltersFromURL in ProductFilterBar
  const { pendingRating, setPendingRating } = useFilterStore();
  
  // Function to check if a rating is currently refined/selected (using PENDING state)
  const isRatingSelected = (rating: string) => {
    return pendingRating === rating;
  };
  
  // Handle rating selection/deselection - updates PENDING state only
  const handleRatingSelect = (rating: string) => {
    if (pendingRating === rating) {
      setPendingRating(null); // Deselect if already selected
    } else {
      setPendingRating(rating); // Select new rating
    }
  };

  // Create an array with all possible ratings (5 to 1)
  // Note: Requires average_rating to be searchable (not filterOnly) in Algolia to get counts
  const allRatings = [5, 4, 3, 2, 1].map(rating => {
    const ratingStr = String(rating);
    // Find this rating in the Algolia items or create a default entry
    const foundItem = algoliaRatingItems.find(item => item.label === ratingStr);
    const count = foundItem ? foundItem.count : 0;
    
    return {
      label: ratingStr,
      count: count,
      isRefined: pendingRating === ratingStr // Use pending state for UI
    };
  });

  return (
    <Accordion heading='Ocena produktu'>
      <ul className='px-4'>
        {allRatings.map(({ label, count, isRefined }) => (
          <li
            key={label}
            className='mb-4 flex items-center gap-2'
          >
            <FilterCheckboxOption
              checked={isRefined}
              disabled={count === 0}
              label={label}
              onCheck={handleRatingSelect}
            />
            <StarRating
              rate={+label}
            />
            <span className='label-sm !font-light'>
              ({count})
            </span>
          </li>
        ))}
      </ul>
      
      
    </Accordion>
  );
};

// Export with both names for backward compatibility
export const SellerRatingFilter = ProductRatingFilter;
