'use client';

import { ArrowLeftIcon } from '@/icons';
import { SafeI18nLink as Link } from '@/components/atoms/SafeI18nLink';
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
              className="mr-3 p-1  rounded-full transition-colors"
              aria-label="Wróć do poprzedniego poziomu"
            >
              <ArrowLeftIcon size={20} className="text-gray-600" />
            </button>
          )}
          <h2 className="text-lg font-semibold text-[#3B3634]">
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
            onClick={() => setTimeout(() => onClose(), 100)}
            aria-label="Przeglądaj wszystkie produkty"
          >
            <div className="flex items-center justify-between w-full py-4 px-4 border-b border-gray-200  transition-colors">
              <span className="text-base font-instrument-sans font-medium text-[#3B3634] ">
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
            onClick={() => setTimeout(() => onClose(), 100)}
            aria-label={`Zobacz wszystkie produkty w kategorii ${level.parentCategory.name}`}
          >
            <div className="flex items-center justify-between w-full py-4 px-4 border-b-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="text-base font-semibold text-primary">
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

        {/* Promotions link - only on root level */}
        {isRoot && (
          <Link 
            href="/promotions" 
            className="block w-full"
            onClick={() => setTimeout(() => onClose(), 100)}
            aria-label="Przeglądaj promocje"
          >
            <div className="flex items-center justify-between w-full py-4 px-4 border-t-2 border-red-100 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors">
              <span className="text-base font-instrument-sans font-semibold text-red-600">
                Promocje
              </span>
            </div>
          </Link>
        )}

        {/* Empty state */}
        {level.categories.length === 0 && (
          <div className="p-8 text-center text-gray-500" role="status">
            <p>Brak podkategorii</p>
          </div>
        )}
      </div>
    </div>
  );
};