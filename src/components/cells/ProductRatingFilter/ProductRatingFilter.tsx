'use client';

import {
  Accordion,
  FilterCheckboxOption,
} from '@/components/molecules';
import { StarRating } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/stores/filterStore';

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
  // Get rating selection from Zustand store
  const { selectedRating, setSelectedRating } = useFilterStore();
  
  // Function to check if a rating is currently refined/selected (using Zustand store)
  const isRatingSelected = (rating: string) => {
    return selectedRating === rating;
  };
  
  // Handle rating selection/deselection (UI-only, updates Zustand store)
  const handleRatingSelect = (rating: string) => {
    if (selectedRating === rating) {
      setSelectedRating(null); // Deselect if already selected
    } else {
      setSelectedRating(rating); // Select new rating
    }
  };

  // Create an array with all possible ratings (5 to 1)
  const allRatings = [5, 4, 3, 2, 1].map(rating => {
    const ratingStr = String(rating);
    // Find this rating in the Algolia items or create a default entry
    const foundItem = algoliaRatingItems.find(item => item.label === ratingStr);
    return {
      label: ratingStr,
      count: foundItem ? foundItem.count : 0,
      isRefined: selectedRating === ratingStr // Use Zustand store state for UI
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
