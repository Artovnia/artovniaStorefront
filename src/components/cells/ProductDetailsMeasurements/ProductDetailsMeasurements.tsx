// src/components/cells/ProductDetailsMeasurements/ProductDetailsMeasurements.tsx
'use client';

import {
  ProductPageAccordion,
  ProdutMeasurementRow,
} from '@/components/molecules';
import { SingleProductMeasurement } from '@/types/product';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useVariantSelection } from '@/components/context/VariantSelectionContext';
import { getProductMeasurements } from '@/lib/data/measurements';
import { unifiedCache, CACHE_TTL } from '@/lib/utils/unified-cache';

interface MeasurementProps {
  productId: string;
  locale?: string;
  variants?: Array<{ id: string; title?: string }>;
  initialMeasurements?: SingleProductMeasurement[];
}

export const ProductDetailsMeasurements = ({
  productId,
  locale = 'pl',
  variants = [],
  initialMeasurements
}: MeasurementProps) => {
  const { selectedVariantId } = useVariantSelection();
  
  // Ensure initialMeasurements is always an array
  const safeInitialMeasurements = Array.isArray(initialMeasurements) ? initialMeasurements : []
  
  const [measurements, setMeasurements] = useState<SingleProductMeasurement[]>(safeInitialMeasurements);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPending, startTransition] = useTransition();
  // hasFetchedInitial is true when the server already attempted a fetch (prop was passed, even if empty).
  // Using prop presence (initialMeasurements !== undefined) prevents a redundant client re-fetch.
  const [hasFetchedInitial, setHasFetchedInitial] = useState(initialMeasurements !== undefined);
  
  // Track request cache to avoid duplicate requests
  const requestCacheRef = useRef(new Map<string, Promise<SingleProductMeasurement[]>>());
  const debouncedVariantChangeRef = useRef<NodeJS.Timeout | null>(null);
  
  const findVariantMeasurements = useCallback((variantId: string) => {
    const variantMeasurements = measurements.filter(m => m.variantId === variantId);
    const productMeasurements = measurements.filter(m => !m.variantId);
    return variantMeasurements.length > 0 ? variantMeasurements : productMeasurements;
  }, [measurements]);
  
  const fetchMeasurementsFromAPI = useCallback(async (productId: string, variantId: string) => {
    if (!productId || !variantId) return false;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // ✅ FIXED: Use unified cache properly with timeout protection
      const cacheKey = `measurements:${productId}:${variantId}:${locale}`
      
      const data = await unifiedCache.get(
        cacheKey,
        async () => {
          // Create timeout with proper cleanup
          let timeoutId: NodeJS.Timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Measurements request timeout')), 5000)
          })

          return Promise.race([
            getProductMeasurements(productId, variantId, locale),
            timeoutPromise
          ]).finally(() => {
            if (timeoutId) clearTimeout(timeoutId)
          });
        },
        CACHE_TTL.MEASUREMENTS
      );
      
      // Validate the data is an array
      if (Array.isArray(data)) {
        setMeasurements(data);
        setHasError(false);
        return true;
      } else {
        setHasError(true);
        return false;
      }
    } catch (error) {
      // Handle timeout errors gracefully to prevent navigation freeze
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('Measurements request timed out, continuing without measurements');
        setHasError(false); // Don't show error for timeout, just continue without measurements
        setMeasurements([]); // Set empty measurements
      } else {
        console.error('Error fetching measurements:', error);
        setHasError(true);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [locale]);
  
  // Load initial measurements if not provided from server
  useEffect(() => {
    if (!hasFetchedInitial && productId && selectedVariantId) {
      setHasFetchedInitial(true);
      startTransition(async () => {
        await fetchMeasurementsFromAPI(productId, selectedVariantId);
      });
    }
  }, [productId, selectedVariantId, hasFetchedInitial]);
  
  // Handle variant changes
  useEffect(() => {
    if (!productId || !selectedVariantId || !hasFetchedInitial) return;
    
    // Clear any pending debounced calls
    if (debouncedVariantChangeRef.current) {
      clearTimeout(debouncedVariantChangeRef.current);
    }
    
    // Try to use local data first
    const localMeasurements = findVariantMeasurements(selectedVariantId);
    if (localMeasurements.length > 0) {
      setMeasurements(localMeasurements);
      return;
    }
    
    // Debounced API call
    debouncedVariantChangeRef.current = setTimeout(() => {
      startTransition(() => {
        fetchMeasurementsFromAPI(productId, selectedVariantId);
      });
    }, 300);
    
    return () => {
      if (debouncedVariantChangeRef.current) {
        clearTimeout(debouncedVariantChangeRef.current);
      }
    };
  }, [productId, selectedVariantId, hasFetchedInitial]); // Removed callback dependencies to prevent infinite loop
  
  const accordionTitle = locale === 'pl' ? 'Wymiary' : 'Dimensions';
  
  // Loading state
  if (isLoading && measurements.length === 0) {
    return (
      <div className="m-0">
        <ProductPageAccordion
          heading={accordionTitle}
          defaultOpen={false}
        >
          <div className="w-full py-8 flex flex-col items-center space-y-2" role="status">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ui-border-interactive" aria-hidden="true"></div>
            <p className="text-sm text-gray-500">
              {locale === 'pl' ? 'Ładowanie wymiarów...' : 'Loading measurements...'}
            </p>
          </div>
        </ProductPageAccordion>
      </div>
    );
  }
  
  // Error state
  if (hasError && measurements.length === 0) {
    return (
      <div className="m-0">
        <ProductPageAccordion
          heading={accordionTitle}
          defaultOpen={false}
        >
          <div className="w-full py-8 flex flex-col items-center space-y-2" role="alert">
            <p className="text-sm text-gray-500">
              {locale === 'pl' 
                ? 'Nie udało się załadować wymiarów' 
                : 'Failed to load measurements'}
            </p>
            <button 
              onClick={() => {
                if (selectedVariantId) {
                  fetchMeasurementsFromAPI(productId, selectedVariantId);
                }
              }}
              className="text-xs px-3 py-1 border rounded hover:bg-gray-50 transition-colors"
              disabled={isLoading}
              aria-label={locale === 'pl' ? 'Spróbuj ponownie załadować wymiary' : 'Try loading measurements again'}
            >
              {locale === 'pl' ? 'Spróbuj ponownie' : 'Try again'}
            </button>
          </div>
        </ProductPageAccordion>
      </div>
    );
  }
  

  // Show loading state if we haven't tried to fetch yet
  if (!hasFetchedInitial && !isLoading && (!measurements || measurements.length === 0)) {
    return (
      <div className="m-0">
        <ProductPageAccordion
          heading={accordionTitle}
          defaultOpen={false}
        >
          <div className="p-4 text-center text-secondary">
            {locale === 'pl' ? 'Ładowanie wymiarów...' : 'Loading dimensions...'}
          </div>
        </ProductPageAccordion>
      </div>
    );
  }

  // If we have no measurements after trying to fetch, show "no measurements" message with retry
  if (!measurements || measurements.length === 0) {
    return (
      <div className="m-0">
        <ProductPageAccordion
          heading={accordionTitle}
          defaultOpen={false}
        >
          <div className="p-4 text-center text-[#3B3634]/90 ">
            <p className="mb-3">
              {locale === 'pl' ? 'Brak dostępnych wymiarów dla tego produktu' : 'No dimensions available for this product'}
            </p>
           
          </div>
        </ProductPageAccordion>
      </div>
    );
  }

  return (
    <div className="m-0">
      <ProductPageAccordion
        heading={accordionTitle}
        defaultOpen={false}
      >
        <div className="relative" aria-busy={isLoading}>
          {/* Loading overlay for variant changes */}
          {isLoading && measurements.length > 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10" role="status" aria-label={locale === 'pl' ? 'Aktualizowanie wymiarów' : 'Updating measurements'}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ui-border-interactive" aria-hidden="true"></div>
            </div>
          )}
          
          {measurements.map((measurement: SingleProductMeasurement) => (
            <ProdutMeasurementRow
              key={`${measurement.label}-${measurement.variantId || 'product'}`}
              measurement={measurement}
            />
          ))}
          
          {/* Error indicator for partial failures */}
          {hasError && measurements.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              {locale === 'pl' 
                ? 'Niektóre wymiary mogą być nieaktualne' 
                : 'Some measurements might be outdated'}
            </div>
          )}
        </div>
      </ProductPageAccordion>
    </div>
  );
};