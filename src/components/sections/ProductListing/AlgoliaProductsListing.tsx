"use client"

import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
  CategorySidebar,
  ProductFilterBar,
} from "@/components/organisms"
import { SelectField } from "@/components/molecules/SelectField/SelectField"
import { Configure, useHits } from "react-instantsearch"
import React, { useEffect, useState } from "react"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { liteClient as algoliasearch } from "algoliasearch/lite"
import { useMemo } from "react"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"

// Access environment variables directly
const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID || "";
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX || "products";

// Import these after the constants to avoid hoisting issues
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"

export const AlgoliaProductsListing = ({
  category_id,
  category_ids,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  categories = [],
}: {
  category_id?: string
  category_ids?: string[]
  collection_id?: string
  locale?: string
  seller_handle?: string
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const searchParams = useSearchParams()

  // Get URL parameters for filtering and pagination
  const facetFilters: string = getFacedFilters(searchParams)
  const page: number = +(searchParams.get("page") || 1)
  const query: string = searchParams.get("query") || ""
  const sortBy: string | null = searchParams.get("sortBy") || null
  

  // Build the filter string for Algolia
  const filterParts: string[] = [];
  
  // Prepare facet filters array for Algolia's facetFilters parameter
  const facetFiltersList: string[][] = [];
  
  // Only filter by seller if a specific seller handle is provided
  if (seller_handle) {
    filterParts.push(`seller.handle:"${seller_handle}"`);
  }
  
  // Add category filter if specified - support both single category_id and multiple category_ids
  const effectiveCategoryIds = category_ids || (category_id ? [category_id] : [])
  
  if (effectiveCategoryIds.length > 0) {
    // For Algolia array filtering, use facetFilters which is the recommended approach
    // Categories are stored as an array of objects with id and name fields
    // Use facetFilters for array field filtering - this is the correct Algolia approach
    
    // For multiple categories, create OR filter (any product in any of these categories)
    const categoryFilters = effectiveCategoryIds.map(id => `categories.id:${id}`)
    facetFiltersList.push(categoryFilters);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Algolia filtering by categories:`, effectiveCategoryIds);
    }
  }
  
  // Add collection filter if specified
  if (collection_id) {
    facetFiltersList.push([`collections.id:${collection_id}`]);
  }
  
  // Add any additional facet filters from URL parameters
  if (facetFilters && facetFilters.trim() !== '') {
    const cleanedFacetFilters = facetFilters.trim().startsWith('AND') 
      ? facetFilters.trim().substring(3).trim() 
      : facetFilters.trim();
      
    if (cleanedFacetFilters) {
      filterParts.push(cleanedFacetFilters);
    }
  }
  
  // IMPORTANT: When there's a search query, we should NOT filter by products.title
  // Instead, let Algolia's search functionality handle the query
  // Remove any products.title filter if we have a search query
  if (query) {
    const titleFilterIndex = filterParts.findIndex(part => part.startsWith('products.title:'));
    if (titleFilterIndex !== -1) {
      filterParts.splice(titleFilterIndex, 1);
    }
  }
  
  const filters = filterParts.length > 0 ? filterParts.join(' AND ') : ''
  
  // Define UI sort options for display in the SelectField
  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]
  
  // Define index names using our naming constants for consistency
  // Base product index
  const PRIMARY_INDEX_NAME = ALGOLIA_INDEX_NAME;
  
  // Map UI sort options to the correct replica indices
  // These replica indices are configured in the Algolia backend
  const getIndexName = (sortOption: string | null): string => {
    const PRIMARY_INDEX_NAME = ALGOLIA_INDEX_NAME;
    
    // Use the replica indices with their predefined sorting
    // These match the constants in the backend service.ts PRODUCT_REPLICAS
    switch (sortOption) {
      case 'price_asc':
        return `${PRIMARY_INDEX_NAME}_price_asc`;
      case 'price_desc':
        return `${PRIMARY_INDEX_NAME}_price_desc`;
      case 'created_at_desc':
        return `${PRIMARY_INDEX_NAME}_created_at_desc`;
      case 'created_at_asc':
        return `${PRIMARY_INDEX_NAME}_created_at_asc`;
      default:
        return PRIMARY_INDEX_NAME;
    }
  }
  
  // Get the index name based on sort selection
  const activeIndexName = getIndexName(sortBy);
  
  // Create search parameters object for Algolia
  const algoliaParams: any = {
    query,  // Use Algolia's search functionality
    hitsPerPage: PRODUCT_LIMIT,
    page: page - 1,
  };
  
  // Search configuration that balances precision and recall
  if (query) {
    // Common settings for all queries
    algoliaParams.typoTolerance = false;
    
    // For short fragments like "est"
    if (query.length <= 3) {
      // For short queries, we want to be more lenient
      // Match any word that contains the query as a substring
      algoliaParams.queryType = 'prefixNone';
      
      // Other settings to help with short queries
      algoliaParams.enableRules = true;
    } else {
      // For longer queries like "test", be more precise
      // Only match whole words that exactly match the query
      algoliaParams.queryType = 'prefixLast';
      algoliaParams.advancedSyntax = true;
    }
  }
  
  // Add filters if any (for non-array fields)
  if (filters) {
    algoliaParams.filters = filters;
  }
  
  // Add facet filters if any (for array fields like categories)
  if (facetFiltersList.length > 0) {
    algoliaParams.facetFilters = facetFiltersList;
  }
  
  // Use as configureProps
  const configureProps = algoliaParams;
  
  // Create a memoized search client to prevent re-renders
  const searchClient = useMemo(() => {
    return algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);
  }, []);
  
  // We can now use the correct replica index based on the sort option
  // The replica indices are configured in the backend to have the right sorting
  
  // Create a stable key for InstantSearch to prevent unnecessary remounting
  // Only include essential parameters that should trigger a full reset
  const instantSearchKey = useMemo(() => {
    return `${category_id || 'all'}-${collection_id || 'all'}-${seller_handle || 'all'}`;
  }, [category_id, collection_id, seller_handle]);

  // Use the correct indexName based on sort selection
  return (
    <InstantSearchNext 
      key={instantSearchKey}
      searchClient={searchClient} 
      indexName={activeIndexName}
    >
      <Configure {...configureProps} />
      <ProductsListing sortOptions={sortOptions} category_id={category_id} categories={categories} />
    </InstantSearchNext>
  )
}

// Define the interface for sort options
interface SortOption {
  label: string
  value: string
}

// Define props interface for the ProductsListing component
interface ProductsListingProps {
  sortOptions?: SortOption[]
  category_id?: string
  categories?: HttpTypes.StoreProductCategory[]
}


const ProductsListing = ({ sortOptions, category_id, categories = [] }: ProductsListingProps) => {
  const {
    items,
    results,
    // sendEvent,
  } = useHits()
  const updateSearchParams = useUpdateSearchParams()
  
  // Centralized fetch of customer and wishlist data for all product cards
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Function to refresh wishlist data after wishlist changes
  const refreshWishlist = async () => {
    if (!user) return;
    
    try {
      const wishlistData = await getUserWishlists()
      setWishlist(wishlistData.wishlists || [])
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }
  
  // Fetch user and wishlist data
  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      const customer = await retrieveCustomer()
      setUser(customer)
      
      if (customer) {
        const wishlistData = await getUserWishlists()
        setWishlist(wishlistData.wishlists || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(null)
      setWishlist([])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial fetch when component mounts
  useEffect(() => {
    fetchUserData()
  }, []) // Empty dependency array - initial fetch only once when component mounts

  const selectOptionHandler = (value: string) => {
    // Update the URL search params to trigger re-render with new sort
    updateSearchParams("sortBy", value);
  }

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  return (
    <>
      {/* Main Layout: (Results Count + Category Sidebar) + (Filter Bar + Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Results Count + Category Sidebar - Hidden below 768px (md breakpoint) */}
        <div className="hidden lg:block lg:col-span-1">
          {/* Results Count - Above category sidebar */}
          <div className="mb-4">
            <div className="label-md">{`${results?.nbHits} wyników`}</div>
          </div>
          
          {/* Category Sidebar */}
          <div className="sticky top-24">
            <CategorySidebar 
              parentCategoryHandle={category_id ? undefined : undefined} 
              className="bg-primary p-4"
              categories={categories}
            />
          </div>
        </div>

        {/* Right Column: Filter Bar + Products */}
        <div className="lg:col-span-4">
          {/* Filter Bar - Above products */}
          <div className="mb-6">
            <ProductFilterBar />
          </div>

          {/* Products Grid - Below filter bar */}
          <div className="w-full">
            {!items.length ? (
              <div className="text-center w-full my-10">
                <h2 className="uppercase text-primary heading-lg">Brak wyników</h2>
                <p className="mt-4 text-lg">
                  Nie znaleziono produktów spełniających Twoje kryteria
                </p>
              </div>
            ) : (
              <div className="w-full flex justify-center xl:justify-start">
                <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-fit mx-auto xl:mx-0">
                  {items.map((hit) => (
                    <ProductCard 
                      key={hit.objectID} 
                      product={hit} 
                      user={user}
                      wishlist={wishlist}
                      onWishlistChange={refreshWishlist}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Pagination */}
          <ProductsPagination pages={results?.nbPages || 1} />
        </div>
      </div>
    </>
  )
}