'use client';
import { Chip } from '@/components/atoms';
import useFilters from '@/hooks/useFilters';
import { CloseIcon } from '@/icons';
import { useTranslations } from 'next-intl';

export const ActiveFilterElement = ({
  filter,
}: {
  filter: string[];
}) => {
  const t = useTranslations('ProductListing.filters');
  const { updateFilters } = useFilters(filter[0]);

  const activeFilters = filter[1].split(',');
  
  // Map for dimension and other filter display names to avoid translation errors
  const filterDisplayNames: Record<string, string> = {
    // Dimension filters
    'min_width': 'Min. szerokość',
    'max_width': 'Maks. szerokość',
    'min_height': 'Min. wysokość',
    'max_height': 'Maks. wysokość',
    'min_length': 'Min. długość',
    'max_length': 'Maks. długość',
    // Other filters
    'size': 'Rozmiar',
    'color': 'Kolor',
    'rating': 'Ocena',
    'min_price': 'Cena od',
    'max_price': 'Cena do',
    'condition': 'Stan'
  };

  const removeFilterHandler = (filter: string) => {
    updateFilters(filter);
  };
  
  // Get display name for the filter parameter
  const getFilterParamDisplayName = (paramName: string) => {
    // Check our custom mapping first
    if (filterDisplayNames[paramName]) {
      return filterDisplayNames[paramName];
    }
    
    // Try translation as fallback
    try {
      return t(`${paramName}`);
    } catch (error) {
      // If translation fails, format the parameter name for better display
      return paramName
        .replace('_', ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
    }
  };

  return (
    <div className='flex gap-2 items-center'>
      <span className='label-md hidden md:inline-block'>
        {getFilterParamDisplayName(filter[0])}:
      </span>
      {activeFilters.map((element) => {
        const Element = () => {
          return (
            <span className='flex gap-2 items-center cursor-default whitespace-nowrap'>
              {element}{' '}
              <span
                onClick={() => removeFilterHandler(element)}
              >
                <CloseIcon
                  size={16}
                  className='cursor-pointer'
                />
              </span>
            </span>
          );
        };
        return <Chip key={element} value={<Element />} />;
      })}
    </div>
  );
};
