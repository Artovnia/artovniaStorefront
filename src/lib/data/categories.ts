import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"

interface CategoriesProps {
  query?: Record<string, any>
  headingCategories?: string[]
}

export const listCategories = async ({
  query,
  headingCategories = [],
}: Partial<CategoriesProps> = {}) => {
  const limit = query?.limit || 100

  const categories = await sdk.client
    .fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "handle, name, rank, *category_children",
        limit,
        ...query,
      },
      cache: "no-cache",
    })
    .then(({ product_categories }) => product_categories)

  const parentCategories = categories.filter(({ name }) =>
    headingCategories.includes(name.toLowerCase())
  )

  // Get all child category IDs to filter them out from main categories
  const allChildCategoryIds = new Set<string>()
  categories.forEach(category => {
    if (category.category_children && category.category_children.length > 0) {
      category.category_children.forEach(child => {
        allChildCategoryIds.add(child.id)
      })
    }
  })

  // Filter out categories that are children of other categories and not in headingCategories
  const childrenCategories = categories.filter(
    ({ name, id }) => 
      !headingCategories.includes(name.toLowerCase()) && 
      !allChildCategoryIds.has(id)
  )

  return {
    categories: childrenCategories,
    parentCategories: parentCategories,
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  try {
    const decodedHandle = categoryHandle.map(segment => decodeURIComponent(segment)).join("/")

    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children",
          handle: decodedHandle,
        },
        cache: "no-cache",
      }
    )
    
    if (response?.product_categories?.length > 0) {
      return response.product_categories[0]
    }
    
    try {
      const allCategoriesResponse = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children",
            limit: 100,
          },
          cache: "no-cache",
        }
      )
      
      if (allCategoriesResponse?.product_categories?.length > 0) {
        const searchTerm = decodedHandle.toLowerCase()
        const matchingCategory = allCategoriesResponse.product_categories.find(
          cat => cat.handle?.toLowerCase() === searchTerm || cat.name?.toLowerCase() === searchTerm
        )
        
        if (matchingCategory) {
          return matchingCategory
        }
      }
    } catch (fallbackError) {
      // Silently handle fallback errors
    }
    
    return null
  } catch (error) {
    return null
  }
}