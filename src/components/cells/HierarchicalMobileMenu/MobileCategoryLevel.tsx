'use client';

import { ArrowLeftIcon } from '@/icons';
import { SafeI18nLink as Link } from '@/components/atoms/SafeI18nLink';
import { cn } from '@/lib/utils';
import { MobileCategoryItem } from './MobileCategoryItem';
import { MobileCategoryLevelProps } from './types';

export const MobileCategoryLevel = ({
  level,
  onNavigate,
  onBack,
  onClose,
  isRoot,
}: MobileCategoryLevelProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header with back button and title */}
      <div className="flex items-center justify-between p-4 border-b border-[#BFB7AD] bg-primary sticky top-0 z-10">
        <div className="flex items-center">
          {!isRoot && (
            <button
              onClick={onBack}
              className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Wróć do poprzedniego poziomu"
            >
              <ArrowLeftIcon size={20} className="text-gray-600" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {isRoot ? 'Kategorie' : level.name}
          </h2>
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto">
        {/* "All Products" link only on root level */}
        {isRoot && (
          <Link 
            href="/categories" 
            className="block w-full"
            onClick={onClose}
          >
            <div className="flex items-center justify-between w-full py-4 px-4 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <span className="text-base font-instrument-sans font-medium text-gray-900">
                Wszystkie produkty
              </span>
            </div>
          </Link>
        )}

        {/* Parent category link (if not root and parent exists) */}
        {!isRoot && level.parentCategory && (
          <Link 
            href={`/categories/${level.parentCategory.handle}`} 
            className="block w-full"
            onClick={onClose}
          >
            <div className="flex items-center justify-between w-full py-4 px-4 border-b-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="text-base font-semibold text-primary capitalize">
                Zobacz wszystkie: {level.parentCategory.name}
              </span>
            </div>
          </Link>
        )}

        {/* Category items */}
        {level.categories.map((category) => (
          <MobileCategoryItem
            key={category.id}
            category={category}
            onNavigate={onNavigate}
            onClose={onClose}
          />
        ))}

        {/* Empty state */}
        {level.categories.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>Brak podkategorii</p>
          </div>
        )}
      </div>
    </div>
  );
};
