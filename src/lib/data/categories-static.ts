import { HttpTypes } from "@medusajs/types"

/**
 * STATIC CATEGORY FALLBACK
 * 
 * Essential top-level categories for immediate render
 * Used for perceived performance - shows navigation instantly
 * Full category data loads in background
 */
export const ESSENTIAL_CATEGORIES: Partial<HttpTypes.StoreProductCategory>[] = [
  {
    id: "cat_ona",
    name: "Ona",
    handle: "ona",
    rank: 1,
    category_children: []
  },
  {
    id: "cat_zwierzeta",
    name: "Zwierzęta",
    handle: "zwierzeta",
    rank: 2,
    category_children: []
  },
  {
    id: "cat_dom",
    name: "Dom",
    handle: "dom",
    rank: 3,
    category_children: []
  },
  {
    id: "cat_akcesoria",
    name: "Akcesoria",
    handle: "akcesoria",
    rank: 4,
    category_children: []
  },
  {
    id: "cat_prezenty",
    name: "Prezenty i okazje",
    handle: "prezenty-i-okazje",
    rank: 5,
    category_children: []
  }
]

/**
 * Get essential categories for immediate render
 * No API calls - instant response
 */
export function getEssentialCategories(): {
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
} {
  return {
    parentCategories: ESSENTIAL_CATEGORIES as HttpTypes.StoreProductCategory[],
    categories: ESSENTIAL_CATEGORIES as HttpTypes.StoreProductCategory[]
  }
}
