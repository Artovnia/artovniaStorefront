"use client"

import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
  CategorySidebar,
  ProductFilterBar,
} from "@/components/organisms"
import { MobileCategoryBreadcrumbs } from "@/components/molecules/MobileCategoryBreadcrumbs"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { SelectField } from "@/components/molecules/SelectField/SelectField"
import { Configure, useHits, useRefinementList } from "react-instantsearch"
import React, { useEffect, useState, useRef } from "react"
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

// 🛡️ DEPLOYMENT-SAFE: Validate Algolia configuration
const hasValidAlgoliaConfig = !!(ALGOLIA_ID && ALGOLIA_SEARCH_KEY && ALGOLIA_INDEX_NAME);

// Import these after the constants to avoid hoisting issues
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { PRODUCT_LIMIT } from "@/const"
import { useFilterStore } from "@/stores/filterStore"

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
  // 🛡️ DEPLOYMENT-SAFE: Check config first, render fallback component if missing
  // This avoids React Hooks violations by handling the fallback at component level
  if (!hasValidAlgoliaConfig) {
    return <AlgoliaProductsListingFallback {...props} />
  }
  
  return <AlgoliaProductsListingWithConfig {...props} />
}

// Fallback component when Algolia config is missing
const AlgoliaProductsListingFallback = (props: AlgoliaProductsListingProps) => {
  const {
    category_id,
    category_ids,
    collection_id,
    seller_handle,
    categories = [],
    currentCategory,
  } = props
  
  // Dynamically import ProductListing to avoid circular dependencies
  const ProductListingFallback = React.lazy(() => 
    import('./ProductListing').then(mod => ({ default: mod.ProductListing }))
  )
  
  return (
    <React.Suspense fallback={null}>
      <ProductListingFallback
        category_id={category_id}
        category_ids={category_ids}
        collection_id={collection_id}
        seller_id={seller_handle}
        categories={categories}
        currentCategory={currentCategory}
      />
    </React.Suspense>
  )
}

// Main Algolia component with all hooks
const AlgoliaProductsListingWithConfig = (props: AlgoliaProductsListingProps) => {
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

  // Track if we've ever received Algolia results — persists across InstantSearch remounts
  // so revisiting a category doesn't flash skeleton
  const hasEverHadResults = useRef(false)

  const searchParams = useSearchParams()

  // Get URL parameters for filtering and pagination
  // CRITICAL FIX: getFacedFilters now returns object with filters and numericFilters
  const filterResult = getFacedFilters(searchParams)
  const facetFilters: string = filterResult.filters
  const numericFilters: string[] = filterResult.numericFilters
  const page: number = +(searchParams.get("page") || 1)
  const query: string = searchParams.get("query") || ""
  const sortBy: string | null = searchParams.get("sortBy") || null
  

  // Read active color and rating selections from Zustand store
  // These are added to the unified 'filters' string (not facetFilters array)
  // to ensure compatibility with both primary and replica indices
  const { selectedColors, selectedRating } = useFilterStore()
  
  // Build the unified filter string for Algolia's 'filters' parameter.
  // IMPORTANT: We use the 'filters' string (not 'facetFilters' array) because:
  // - 'filters' works on both primary and replica indices without requiring
  //   each attribute to be in attributesForFaceting on every replica
  // - 'filters' supports both facet-style (attribute:value) and numeric (>=, <=) syntax
  // - All conditions joined by AND combine correctly
  const filterParts: string[] = [];
  
  // Seller filter
  if (seller_handle) {
    filterParts.push(`seller.handle:"${seller_handle}"`);
  }
  
  // Category filter — support both category_ids and categories.id with OR fallback
  const effectiveCategoryIds = category_ids || (category_id ? [category_id] : [])
  
  if (effectiveCategoryIds.length > 0) {
    // Build OR group: (category_ids:id1 OR categories.id:id1 OR category_ids:id2 OR categories.id:id2)
    const categoryOrParts = effectiveCategoryIds.flatMap(id => [
      `category_ids:"${id}"`,
      `categories.id:"${id}"`
    ])
    filterParts.push(`(${categoryOrParts.join(' OR ')})`);
  }
  
  // Collection filter
  if (collection_id) {
    filterParts.push(`collections.id:"${collection_id}"`);
  }
  
  // Color filters from Zustand store (OR'd together — user wants any of these colors)
  if (selectedColors.length > 0) {
    const colorOrParts = selectedColors.map(color => `color_families:"${color}"`)
    filterParts.push(`(${colorOrParts.join(' OR ')})`);
  }
  
  // Rating filter from Zustand store
  if (selectedRating) {
    filterParts.push(`average_rating:${selectedRating}`);
  }
  
  // URL-based filters (size, dimensions, condition) from getFacedFilters()
  if (facetFilters && facetFilters.trim() !== '') {
    filterParts.push(facetFilters.trim())
  }
  
  // Remove products.title filter when there's a search query
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
  
  // CRITICAL FIX: Add numeric filters for price and dimensions
  // This prevents "attribute not specified in numericAttributesForFiltering" errors
  // numericFilters work correctly with replica indices and sorting
  if (numericFilters.length > 0) {
    algoliaParams.numericFilters = numericFilters;
  }
  
  // All filters (category, color, rating, size, dimensions) are now in the unified
  // 'filters' string above. No separate facetFilters needed.
  
  // Use as configureProps
  const configureProps = {
    ...algoliaParams,
    // NOTE: Facets are configured in Algolia dashboard, not via API
    // attributesForFaceting is deprecated and causes 400 errors
  };
  
  
  
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
  
  // CRITICAL FIX: Include sortBy in key to force InstantSearch remount when sorting changes
  // This ensures the correct replica index is used and results are properly sorted
  const instantSearchKey = useMemo(() => {
    const categoryKey = category_ids ? category_ids.join(',') : (category_id || 'all');
    const sortKey = sortBy || 'default';
    return `${categoryKey}-${collection_id || 'all'}-${sortKey}`;
  }, [category_id, category_ids, collection_id, sortBy]); // Added sortBy to dependencies

  // Use the correct indexName based on sort selection
  return (
    <PromotionDataProvider countryCode={locale || 'pl'} limit={100}>
      <BatchPriceProvider currencyCode="PLN" days={30}>
        <InstantSearchNext 
          key={instantSearchKey}
          searchClient={searchClient} 
          indexName={activeIndexName}
          future={{
            preserveSharedStateOnUnmount: true,
            persistHierarchicalRootCount: false
          }}
          routing={false}
        >
          <Configure {...configureProps} />
          <ProductsListing 
            sortOptions={sortOptions} 
            category_id={category_id} 
            categories={categories}
            // Pass category_ids for parent category aggregation
            category_ids={category_ids}
            currentCategory={currentCategory}
            hasEverHadResults={hasEverHadResults}
          />
        </InstantSearchNext>
      </BatchPriceProvider>
    </PromotionDataProvider>
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
  hasEverHadResults: React.MutableRefObject<boolean>
}


const ProductsListing = ({ 
  sortOptions, 
  category_id, 
  category_ids, 
  categories = [], 
  currentCategory,
  hasEverHadResults 
}: ProductsListingProps) => {
  const {
    items,
    results,
    // sendEvent,
  } = useHits()
  const updateSearchParams = useUpdateSearchParams()
  
  // Algolia color facet counts — used for display only (counts per color family)
  // Color filtering is applied through Configure's facetFiltersList, not refine()
  const { items: colorFacetItems } = useRefinementList({
    attribute: 'color_families',
    limit: 50,
  })

  
  
  // Rating facet counts — used for display only
  // Rating filtering is applied through Configure's facetFiltersList, not refine()
  const { items: ratingFacetItems } = useRefinementList({
    attribute: 'average_rating',
    limit: 10,
    sortBy: ['name:desc'],
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

  // hasEverHadResults is passed from parent (persists across InstantSearch remounts)
  const isAlgoliaReady = !!results?.processingTimeMS

  if (isAlgoliaReady) {
    hasEverHadResults.current = true
  }

  // Only show product grid skeleton on truly first load (never visited before)
  const showProductSkeleton = !isAlgoliaReady && !hasEverHadResults.current

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 w-full">
        {/* Left Column: Category Sidebar — always rendered immediately */}
        <div className="hidden lg:block lg:col-span-1">
          <CategorySidebar 
            parentCategoryHandle={category_id ? undefined : undefined} 
            className="bg-primary pl-4"
            categories={categories}
            currentCategory={currentCategory}
            resultsCount={results?.nbHits || 0}
          />
        </div>

        {/* Right Column: Filter Bar + Products */}
        <div className="lg:col-span-5">
          {/* Mobile Category Breadcrumbs - Only visible on mobile */}
          <MobileCategoryBreadcrumbs 
            currentCategory={currentCategory} 
            resultsCount={results?.nbHits || 0}
          />
          
          {/* Filter Bar — always rendered, not dependent on Algolia response */}
          <div className="mb-6">
            <ProductFilterBar 
              colorFacetItems={colorFacetItems}
              ratingFacetItems={ratingFacetItems}
            />
          </div>

          {/* Products Grid — skeleton only on first-ever load */}
          <div className="w-full">
            {showProductSkeleton ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-4 lg:gap-6 2xl:gap-8 animate-pulse">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : !items.length && isAlgoliaReady ? (
              <div className="text-center w-full my-10">
                <h2 className="uppercase text-primary heading-lg">Brak wyników</h2>
                <p className="mt-4 text-lg">
                  Nie znaleziono produktów spełniających Twoje kryteria
                </p>
              </div>
            ) : items.length > 0 ? (
              <div className="w-full flex justify-center xl:justify-start">
                <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-4 lg:gap-6 2xl:gap-8 w-fit mx-auto xl:mx-0">
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
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Pagination - Centered on full page width */}
      {isAlgoliaReady && (results?.nbPages || 0) > 1 && (
        <div className="w-full mt-10">
          <ProductsPagination pages={results?.nbPages || 1} />
        </div>
      )}
    </>
  )
}