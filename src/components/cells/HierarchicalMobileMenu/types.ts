import { HttpTypes } from '@medusajs/types';

export interface MenuLevel {
  id: string;
  name: string;
  categories: HttpTypes.StoreProductCategory[];
  parentCategory?: HttpTypes.StoreProductCategory;
}

export interface MobileCategoryItemProps {
  category: HttpTypes.StoreProductCategory;
  onNavigate: (category: HttpTypes.StoreProductCategory) => void;
  onClose: () => void;
}

export interface MobileCategoryLevelProps {
  level: MenuLevel;
  onNavigate: (category: HttpTypes.StoreProductCategory) => void;
  onBack: () => void;
  onClose: () => void;
  isRoot: boolean;
}

export interface HierarchicalMobileMenuProps {
  categories: HttpTypes.StoreProductCategory[];
  isOpen: boolean;
  onClose: () => void;
}
