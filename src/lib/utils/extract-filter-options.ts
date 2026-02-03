import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"

export interface PromotionFilters {
  promotionNames: string[]
  sellerNames: { id: string; name: string }[]
  campaignNames: string[]
  categoryNames: Array<{
    id: string
    name: string
    handle?: string
    parent_category_id?: string | null
    parent_category?: any
    mpath?: string
    category_children?: any[]
  }>
}

/**
 * Extract filter options from already-fetched promotional products
 * This eliminates the need for a separate API call to getPromotionFilterOptions()
 * 
 * @param products - Array of products with promotions
 * @returns Filter options for promotions filter bar
 */
export function extractFilterOptions(
  products: (HttpTypes.StoreProduct & { 
    seller?: SellerProps
    promotions?: any[]
    categories?: any[]
  })[]
): PromotionFilters {
  const promotionNamesSet = new Set<string>()
  const sellersMap = new Map<string, string>()
  const campaignNamesSet = new Set<string>()
  const categoriesMap = new Map<string, any>()
  
  products.forEach(product => {
    // Extract seller information
    if (product.seller?.id && product.seller?.name) {
      sellersMap.set(product.seller.id, product.seller.name)
    }
    
    // Extract promotion codes and campaign names
    product.promotions?.forEach(promo => {
      if (promo.code) {
        promotionNamesSet.add(promo.code)
      }
      if (promo.campaign?.name) {
        campaignNamesSet.add(promo.campaign.name)
      }
    })
    
    // Extract categories
    product.categories?.forEach((cat: any) => {
      if (cat.id && cat.name) {
        categoriesMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
          parent_category_id: cat.parent_category_id,
          parent_category: cat.parent_category,
          mpath: cat.mpath,
          category_children: cat.category_children || []
        })
      }
    })
  })
  
  // Build category hierarchy
  const categories = Array.from(categoriesMap.values())
  
  // Link children to parents
  categories.forEach(cat => {
    if (cat.parent_category_id && categoriesMap.has(cat.parent_category_id)) {
      const parent = categoriesMap.get(cat.parent_category_id)!
      if (!parent.category_children.some((c: any) => c.id === cat.id)) {
        parent.category_children.push(cat)
      }
    }
  })
  
  return {
    promotionNames: Array.from(promotionNamesSet).sort(),
    sellerNames: Array.from(sellersMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    campaignNames: Array.from(campaignNamesSet).sort(),
    categoryNames: categories.sort((a, b) => a.name.localeCompare(b.name))
  }
}
