"use client"

import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
} from "@/components/organisms"
import { SelectField } from "@/components/molecules/SelectField/SelectField"
import { Configure, useHits } from "react-instantsearch"
import React from "react"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { liteClient as algoliasearch } from "algoliasearch/lite"
import { useMemo } from "react"

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
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
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
  
  // Add category filter if specified
  if (category_id) {
    // Medusa stores categories as an array of objects in Algolia
    // We need to use string matching within the categories array
    
    // Method 1: Use Algolia's facet filters syntax
    // This is the recommended approach for filtering array fields in Algolia
    facetFiltersList.push([`categories.id:${category_id}`]);
    
    // Method 2: Use direct attribute filters
    // Adding this as a backup filtering method as well
    filterParts.push(`categories.id:"${category_id}"`);
    
    // Add collection filter if specified
    if (collection_id) {
      facetFiltersList.push([`collections.id:${collection_id}`]);
      filterParts.push(`collections.id:"${collection_id}"`);
    }
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
  
  // Add filters if any
  if (filters) {
    algoliaParams.filters = filters;
  }
  
  // Add facet filters if any
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
  
  // Use the correct indexName based on sort selection
  return (
    <InstantSearchNext 
      searchClient={searchClient} 
      indexName={activeIndexName}
    >
      <Configure {...configureProps} />
      <ProductsListing sortOptions={sortOptions} />
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
}


const ProductsListing = ({ sortOptions }: ProductsListingProps) => {
  const {
    items,
    results,
    // sendEvent,
  } = useHits()
  const updateSearchParams = useUpdateSearchParams()

  const selectOptionHandler = (value: string) => {
    // Update the URL search params to trigger re-render with new sort
    updateSearchParams("sortBy", value);
  }

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  return (
    <>
      <div className="flex justify-between w-full items-center">
        <div className="my-4 label-md">{`${results?.nbHits} listings`}</div>
        {sortOptions && sortOptions.length > 0 && (
          <div className="hidden md:flex gap-2 items-center">
            Sort by:{" "}
            <SelectField
              className="min-w-[200px]"
              options={sortOptions}
              selectOption={selectOptionHandler}
            />
          </div>
        )}
      </div>
      <div className="hidden md:block">
        <ProductListingActiveFilters />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6">
        <div>
          <AlgoliaProductSidebar />
        </div>
        <div className="w-full col-span-3">
          {!items.length ? (
            <div className="text-center w-full my-10">
              <h2 className="uppercase text-primary heading-lg">no results</h2>
              <p className="mt-4 text-lg">
                Sorry, we can&apos;t find any results for your criteria
              </p>
            </div>
          ) : (
            <div className="w-full">
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((hit) => (
                  <ProductCard key={hit.objectID} product={hit} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <ProductsPagination pages={results?.nbPages || 1} />
    </>
  )
}