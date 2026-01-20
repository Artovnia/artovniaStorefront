'use client';

import { ArrowRightIcon } from '@/icons';
import { SafeI18nLink as Link } from '@/components/atoms/SafeI18nLink';
import { cn } from '@/lib/utils';
import { MobileCategoryItemProps } from './types';

export const MobileCategoryItem = ({
  category,
  onNavigate,
  onClose,
}: MobileCategoryItemProps) => {
  const hasChildren = category.category_children && category.category_children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      // Navigate to submenu
      e.preventDefault();
      onNavigate(category);
    } else {
      // For leaf categories, let the link handle navigation but also close menu
      // We'll close the menu after a small delay to allow navigation to start
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-between w-full py-4 px-4",
        "border-b border-gray-200 last:border-b-0",
        "  transition-colors",
        "text-left"
      )}
      onClick={hasChildren ? handleClick : undefined}
    >
      <span className="text-base font-instrument-sans font-medium text-[#3B3634]">
        {category.name}
      </span>
      {hasChildren && (
        <ArrowRightIcon 
          size={20} 
          className="text-gray-400 flex-shrink-0 ml-2" 
        />
      )}
    </div>
  );

  // If it has children, render as button for navigation
  if (hasChildren) {
    return (
      <button className="w-full text-left">
        {content}
      </button>
    );
  }

  // If it's a leaf category, render as link
  return (
    <Link href={`/categories/${category.handle}`} className="block w-full" onClick={handleClick}>
      {content}
    </Link>
  );
};
