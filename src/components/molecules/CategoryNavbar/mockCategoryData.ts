/**
 * Mock category data built from real production categories (categories.json).
 * Used for local testing of the navbar dropdown with icons.
 *
 * Toggle USE_MOCK_DATA in Navbar.tsx to enable.
 */
import { HttpTypes } from "@medusajs/types"
import categoriesJson from "./categories.json"

interface JsonCategory {
  id: string
  name: string
  handle: string
  rank: number
  children?: JsonCategory[]
}

const now = new Date().toISOString()

/**
 * Convert a JSON category node into a Medusa StoreProductCategory shape.
 * Recursively converts children → category_children.
 */
function toMedusaCategory(
  cat: JsonCategory,
  parentId: string | null
): HttpTypes.StoreProductCategory {
  const children: HttpTypes.StoreProductCategory[] = (cat.children || []).map(
    (child) => toMedusaCategory(child, cat.id)
  )

  return {
    id: cat.id,
    created_at: now,
    updated_at: now,
    name: cat.name,
    handle: cat.handle,
    description: "",
    deleted_at: null,
    parent_category_id: parentId,
    parent_category: null,
    category_children: children,
    rank: cat.rank,
    metadata: {},
  }
}

/** All 9 top-level categories with full child/grandchild trees */
export const mockCategoryData: HttpTypes.StoreProductCategory[] = (
  categoriesJson as JsonCategory[]
).map((cat) => toMedusaCategory(cat, null))

/** Retrieve top-level categories (used by Navbar when USE_MOCK_DATA = true) */
export const getTopLevelCategories = (): HttpTypes.StoreProductCategory[] => {
  return mockCategoryData
}
