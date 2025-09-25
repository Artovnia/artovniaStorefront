"use client"

import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
  CategorySidebar,
  ProductFilterBar,
} from "@/components/organisms"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { SelectField } from "@/components/molecules/SelectField/SelectField"
import { Configure, useHits, useRefinementList } from "react-instantsearch"
import React, { useEffect, useState } from "react"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { liteClient as algoliasearch } from "algoliasearch/lite"
import { useMemo } from "react"

import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { retrieveCustomer } from "@/lib/data/customer"

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

interface AlgoliaProductsListingProps {
  category_id?: string
  category_ids?: string[]
  collection_id?: string
  locale?: string
  seller_handle?: string
  seller_name?: string
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}

export const AlgoliaProductsListing = (props: AlgoliaProductsListingProps) => {
  const {
    category_id,
    category_ids,
    collection_id,
    seller_handle,
    seller_name,
    locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
    categories = [],
    currentCategory,
  } = props
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
    // SAFE APPROACH: Try new category_ids field first, fallback to original categories.id
    // This ensures backward compatibility while we transition to the new hierarchy system
    
    // Primary filter: Use new category_ids field for hierarchy support
    const newCategoryFilters = effectiveCategoryIds.map(id => `category_ids:${id}`)
    
    // Fallback filter: Use original categories.id for immediate compatibility
    const originalCategoryFilters = effectiveCategoryIds.map(id => `categories.id:${id}`)
    
    // Use both approaches to ensure results are found
    // This creates: (category_ids:id1 OR category_ids:id2) OR (categories.id:id1 OR categories.id:id2)
    facetFiltersList.push([...newCategoryFilters, ...originalCategoryFilters]);
    
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
    // ✅ FIXED: Request all attributes to prevent incomplete objects
    // Using '*' to get all available attributes, then filter on frontend
    attributesToRetrieve: ['*'],
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
  
  // Create a memoized search client with caching to prevent excessive queries
  const searchClient = useMemo(() => {
    const client = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY);
    
    // OPTIMIZATION: Add client-side caching and request deduplication
    const originalSearch = client.search;
    const cache = new Map();
    const pendingRequests = new Map(); // For deduplication
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
    
    client.search = (requests) => {
      const cacheKey = JSON.stringify(requests);
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    
        return Promise.resolve(cached.result);
      }
      
      // Check if same request is already pending (deduplication)
      const pendingRequest = pendingRequests.get(cacheKey);
      if (pendingRequest) {
    
        return pendingRequest;
      }
      
      // Make new request
      const requestPromise = originalSearch.call(client, requests).then(result => {
        // Cache the result
        cache.set(cacheKey, { result, timestamp: Date.now() });
        
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
        
        // Clean old cache entries (keep cache size manageable)
        if (cache.size > 50) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
        
        return result;
      }).catch(error => {
        // Remove from pending requests on error
        pendingRequests.delete(cacheKey);
        throw error;
      });
      
      // Store pending request for deduplication
      pendingRequests.set(cacheKey, requestPromise);
      
      return requestPromise;
    };
    
    return client;
  }, []);
  
  // We can now use the correct replica index based on the sort option
  // The replica indices are configured in the backend to have the right sorting
  
  // SOLUTION 4: Optimize InstantSearch key to prevent unnecessary remounts
  // Only include essential parameters that should trigger a full reset
  // Exclude frequently changing parameters like sort to prevent excessive remounts
  const instantSearchKey = useMemo(() => {
    // Only include category and collection - remove seller_handle to prevent frequent remounts
    const categoryKey = category_ids ? category_ids.join(',') : (category_id || 'all');
    return `${categoryKey}-${collection_id || 'all'}`;
  }, [category_id, category_ids, collection_id]); // Removed seller_handle from dependencies

  // Use the correct indexName based on sort selection
  return (
    <InstantSearchNext 
      key={instantSearchKey}
      searchClient={searchClient} 
      indexName={activeIndexName}
      future={{
        preserveSharedStateOnUnmount: true // ✅ Fix InstantSearch warning
      }}
    >
      <Configure {...configureProps} />
      <ProductsListing 
        sortOptions={sortOptions} 
        category_id={category_id} 
        categories={categories}

        // Pass category_ids for parent category aggregation
        category_ids={category_ids}
        currentCategory={currentCategory}
      />
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
  category_ids?: string[]
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}


const ProductsListing = ({ 
  sortOptions, 
  category_id, 
  category_ids, 
  categories = [], 
  currentCategory 
}: ProductsListingProps) => {
  const {
    items,
    results,
    // sendEvent,
  } = useHits()
  const updateSearchParams = useUpdateSearchParams()
  
  // SOLUTION  // RESTORED: Algolia color filtering using color_families attribute
  // Based on the product object structure, color_families contains the family names we need
  const { items: colorFacetItems, refine: refineColor } = useRefinementList({
    attribute: 'color_families', // This is the correct attribute for color family filtering
    limit: 50,
  })

  
  
  const { items: ratingFacetItems, refine: refineRating } = useRefinementList({
    attribute: 'average_rating',
    limit: 10,
  })

  // ✅ OPTIMIZED: Memoized user data fetching to prevent re-renders
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false)
  const [debugLogged, setDebugLogged] = useState(false)

  // ✅ OPTIMIZED: Memoized refresh function to prevent re-renders
  const refreshWishlist = useMemo(() => async () => {
    if (!user) return;
    
    try {
      const wishlistData = await getUserWishlists()
      setWishlist(wishlistData.wishlists || [])
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }, [user])
  
  // ✅ OPTIMIZED: Single effect for user data with proper cleanup
  useEffect(() => {
    let isMounted = true
    
    const fetchUserData = async () => {
      try {
        const customer = await retrieveCustomer()
        
        if (!isMounted) return // Prevent state update if component unmounted
        
        setUser(customer)
        
        if (customer) {
          const wishlistData = await getUserWishlists()
          if (isMounted) {
            setWishlist(wishlistData.wishlists || [])
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching user data:', error)
          setUser(null)
          setWishlist([])
        }
      } finally {
        if (isMounted) {
          setIsUserDataLoaded(true)
        }
      }
    }

    fetchUserData()
    
    return () => {
      isMounted = false // Cleanup flag
    }
  }, []) // Empty dependency array - fetch only once

  const selectOptionHandler = (value: string) => {
    // Update the URL search params to trigger re-render with new sort
    updateSearchParams("sortBy", value);
  }

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 w-full">
        {/* Left Column: Category Sidebar with Results Count - Hidden below 768px (md breakpoint) */}
        <div className="hidden lg:block lg:col-span-1">
          {/* Category Sidebar - Now includes results count */}
          <CategorySidebar 
            parentCategoryHandle={category_id ? undefined : undefined} 
            className="bg-primary p-4"
            categories={categories}
            currentCategory={currentCategory}
            resultsCount={results?.nbHits || 0}
          />
        </div>

        {/* Right Column: Filter Bar + Products */}
        <div className="lg:col-span-5">
          {/* Filter Bar - Above products */}
          <div className="mb-6">
            <ProductFilterBar 
              colorFacetItems={colorFacetItems}
              ratingFacetItems={ratingFacetItems}
              refineColor={refineColor}
              refineRating={refineRating}
            />
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12 w-fit mx-auto xl:mx-0">
                    {items
                      .filter((hit: any) => hit?.objectID && hit?.title) 
                      .map((hit: any, index: number) => {
                     
                        return (
                          <ProductCard 
                            key={hit.objectID} 
                            product={hit} 
                            user={user}
                            wishlist={wishlist}
                            onWishlistChange={refreshWishlist}
                          />
                        )
                      })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pagination - Centered on full page width */}
      <div className="w-full mt-10">
        <ProductsPagination pages={results?.nbPages || 1} />
      </div>
    </>
  )
}