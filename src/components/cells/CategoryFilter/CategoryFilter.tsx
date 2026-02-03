'use client';

import { cn } from '@/lib/utils';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { buildCategoryTreeFromFlat } from './CategoryFilterHelpers';

interface CategoryWithChildren {
  id: string;
  name: string;
  handle?: string;
  parent_category_id?: string | null;
  parent_category?: any;
  mpath?: string;
  category_children?: CategoryWithChildren[];
}

interface CategoryFilterProps {
  categories: CategoryWithChildren[];
  selectedCategories?: string[];
  onCategoryChange?: (categoryIds: string[]) => void;
  showCounts?: boolean;
  categoryCounts?: Map<string, number>;
  className?: string;
}

export const CategoryFilter = ({
  categories = [],
  selectedCategories = [],
  onCategoryChange,
  showCounts = false,
  categoryCounts = new Map(),
  className
}: CategoryFilterProps): JSX.Element => {
  // ✅ OPTIMIZED: Handle both nested tree structure (from include_descendants_tree)
  // and flat array (from extractCategoriesFromProducts)
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const uniqueCategories = Array.from(
      new Map(categories.map(cat => [cat.id, cat])).values()
    );

    // Check if categories already have nested children (from include_descendants_tree)
    const hasNestedStructure = uniqueCategories.some(cat => 
      cat.category_children && cat.category_children.length > 0
    );

    if (hasNestedStructure) {
      // ✅ Categories already have tree structure - just filter root categories
      return uniqueCategories.filter(cat => {
        const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null;
        const hasNoParentObj = !cat.parent_category || 
                             cat.parent_category === null || 
                             (typeof cat.parent_category === 'object' && !cat.parent_category.id);
        return hasNoParentId && hasNoParentObj;
      });
    } else {
      // ✅ Flat array - build tree structure using mpath or parent_category_id
      return buildCategoryTreeFromFlat(uniqueCategories);
    }
  }, [categories]);

  // Auto-expand top-level categories (level 0) by default
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set<string>());

  // Update expanded categories when category tree changes
  useEffect(() => {
    const topLevelIds = new Set<string>()
    categoryTree.forEach((cat: CategoryWithChildren) => topLevelIds.add(cat.id))
    setExpandedCategories(topLevelIds)
  }, [categoryTree])

  const toggleSelection = useCallback((categoryId: string) => {
    const newSelections = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoryChange?.(newSelections);
  }, [selectedCategories, onCategoryChange]);

  const toggleExpanded = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  if (categoryTree.length === 0) {
    return (
      <div className={cn(
        "py-6 text-sm text-[#3B3634]/50 text-center font-instrument-sans italic",
        className
      )}>
        Brak dostępnych kategorii
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {categoryTree.map((category) => (
        <CategoryFilterItem
          key={category.id}
          category={category}
          selectedCategories={selectedCategories}
          expandedCategories={expandedCategories}
          onToggleSelection={toggleSelection}
          onToggleExpanded={toggleExpanded}
          showCounts={showCounts}
          categoryCounts={categoryCounts}
          level={0}
        />
      ))}
    </div>
  );
};

interface CategoryFilterItemProps {
  category: CategoryWithChildren;
  selectedCategories: string[];
  expandedCategories: Set<string>;
  onToggleSelection: (categoryId: string) => void;
  onToggleExpanded: (categoryId: string) => void;
  showCounts: boolean;
  categoryCounts: Map<string, number>;
  level: number;
}

const CategoryFilterItem = ({
  category,
  selectedCategories,
  expandedCategories,
  onToggleSelection,
  onToggleExpanded,
  showCounts,
  categoryCounts,
  level
}: CategoryFilterItemProps) => {
  const hasChildren = category.category_children && category.category_children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  const isExpanded = expandedCategories.has(category.id);
  const count = categoryCounts.get(category.id) || 0;
  const isDisabled = showCounts && count === 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center w-full transition-colors duration-150",
          isDisabled && "opacity-40"
        )}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpanded(category.id)}
            className="p-1 rounded hover:bg-[#3B3634]/10 transition-colors"
          >
            <ChevronRight 
              className={cn(
                "w-4 h-4 text-[#3B3634]/40 transition-transform duration-200",
                isExpanded && "rotate-90"
              )} 
            />
          </button>
        ) : (
          <div className="w-6" /> 
        )}

        {/* Category name */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => !isDisabled && onToggleSelection(category.id)}
          className={cn(
            "flex-1 flex items-center justify-between py-2.5 text-left transition-colors",
            !isDisabled && "cursor-pointer hover:bg-[#3B3634]/5"
          )}
        >
          <span 
            className={cn(
              "text-sm font-instrument-sans select-none",
              level === 0 
                ? "font-medium text-[#3B3634]" 
                : "text-[#3B3634]/70",
              isSelected && "text-[#3B3634] font-medium"
            )}
          >
            {category.name}
            {showCounts && count > 0 && (
              <span className="text-[#3B3634]/40 ml-1.5">({count})</span>
            )}
          </span>

          {/* Checkmark */}
          <Check 
            className={cn(
              "w-4 h-4 text-[#3B3634] transition-opacity duration-150",
              isSelected ? "opacity-100" : "opacity-0"
            )}
            strokeWidth={2.5} 
          />
        </button>
      </div>

      {/* Thin centered divider line */}
      <div className="flex justify-center" style={{ paddingLeft: `${level * 16}px` }}>
        <div className="w-[99%] h-px bg-[#3B3634]/10" />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          <div 
            className="absolute top-0 bottom-3 w-px bg-[#3B3634]/10"
            style={{ left: `${level * 16 + 11}px` }}
          />
          {category.category_children?.map((child) => (
            <CategoryFilterItem
              key={child.id}
              category={child}
              selectedCategories={selectedCategories}
              expandedCategories={expandedCategories}
              onToggleSelection={onToggleSelection}
              onToggleExpanded={onToggleExpanded}
              showCounts={showCounts}
              categoryCounts={categoryCounts}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};