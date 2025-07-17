'use client';

import {
  Accordion,
  FilterCheckboxOption,
} from '@/components/molecules';
import { StarRating } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useRefinementList } from 'react-instantsearch';

export const ProductRatingFilter = () => {
  // Use average_rating attribute from Algolia index
  const { items, refine } = useRefinementList({
    attribute: 'average_rating',
    limit: 5,
    sortBy: ['name:desc'],  // Sort from 5 stars to 1 star
  });
  
  // Function to check if a rating is currently refined/selected
  const isRatingSelected = (rating: string) => {
    const foundItem = items.find(item => item.label === rating);
    return foundItem?.isRefined || false;
  };
  
  // Handle rating selection/deselection
  const handleRatingSelect = (rating: string) => {
    // This tells Algolia to toggle the refinement for this rating
    refine(rating);
  };

  // Create an array with all possible ratings (5 to 1)
  const allRatings = [5, 4, 3, 2, 1].map(rating => {
    const ratingStr = String(rating);
    // Find this rating in the Algolia items or create a default entry
    const foundItem = items.find(item => item.label === ratingStr);
    return {
      label: ratingStr,
      count: foundItem ? foundItem.count : 0,
      isRefined: foundItem ? foundItem.isRefined : false
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
