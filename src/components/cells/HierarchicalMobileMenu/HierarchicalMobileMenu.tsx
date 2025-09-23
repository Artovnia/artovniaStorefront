'use client';

import { useState, useMemo, useEffect } from 'react';
import { CloseIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { MobileCategoryLevel } from './MobileCategoryLevel';
import { HierarchicalMobileMenuProps, MenuLevel } from './types';
import { HttpTypes } from '@medusajs/types';

export const HierarchicalMobileMenu = ({
  categories,
  isOpen,
  onClose,
}: HierarchicalMobileMenuProps) => {
  const [navigationStack, setNavigationStack] = useState<MenuLevel[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Get top-level categories (no parent)
  const topLevelCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    return categories.filter(cat => {
      const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null;
      const hasNoParentObj = !cat.parent_category || 
                           cat.parent_category === null || 
                           (typeof cat.parent_category === 'object' && !cat.parent_category.id);
      
      return hasNoParentId && hasNoParentObj;
    });
  }, [categories]);

  // Create root level
  const rootLevel: MenuLevel = useMemo(() => ({
    id: 'root',
    name: 'Kategorie',
    categories: topLevelCategories,
  }), [topLevelCategories]);

  // Get current level (last in stack or root)
  const currentLevel = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : rootLevel;
  const isRoot = navigationStack.length === 0;

  // Handle navigation to subcategory
  const handleNavigate = (category: HttpTypes.StoreProductCategory) => {
    const children = category.category_children || [];
    
    if (children.length > 0) {
      const newLevel: MenuLevel = {
        id: category.id,
        name: category.name,
        categories: children,
        parentCategory: category,
      };
      
      setNavigationStack(prev => [...prev, newLevel]);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setNavigationStack(prev => prev.slice(0, -1));
  };

  // Handle smooth menu close with animation
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setNavigationStack([]);
      setShouldRender(false);
      setIsAnimating(false);
      onClose();
    }, 300); // Match the CSS transition duration
  };

  // Reset navigation when menu closes
  const handleMenuClose = () => {
    handleClose();
  };

  // Handle animation states based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure the element is rendered before animation starts
      setTimeout(() => setIsAnimating(false), 10);
    } else if (shouldRender) {
      setIsAnimating(true);
      setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
        setNavigationStack([]);
      }, 300);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black transition-opacity duration-300",
          isAnimating ? "bg-opacity-0" : "bg-opacity-50"
        )}
        onClick={handleMenuClose}
      />
      
      {/* Menu Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-full max-w-sm bg-primary shadow-xl",
        "transform transition-transform duration-300 ease-in-out",
        isAnimating ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#BFB7AD] bg-primary">
            <h1 className="text-xl font-bold text-gray-900">Menu</h1>
            <button
              onClick={handleMenuClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Zamknij menu"
            >
              <CloseIcon size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <MobileCategoryLevel
              level={currentLevel}
              onNavigate={handleNavigate}
              onBack={handleBack}
              onClose={handleClose}
              isRoot={isRoot}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
