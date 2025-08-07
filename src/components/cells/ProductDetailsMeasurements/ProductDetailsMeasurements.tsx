'use client';

import {
  ProductPageAccordion,
  ProdutMeasurementRow,
} from '@/components/molecules';
import { SingleProductMeasurement } from '@/types/product';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useVariantSelection } from '@/components/context/VariantSelectionContext';
import { getProductMeasurements } from '@/lib/data/measurements';

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
  initialMeasurements = []
}: MeasurementProps) => {
  // Use variant selection from context
  const { selectedVariantId } = useVariantSelection();
  // State for measurements, initialized with server-side data
  const [measurements, setMeasurements] = useState<SingleProductMeasurement[]>(initialMeasurements);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Helper function to find measurements for a specific variant - wrapped in useCallback
  const findVariantMeasurements = useCallback((variantId: string) => {
    // Check if we have measurements for this variant in our data already
    const variantMeasurements = initialMeasurements.filter(m => m.variantId === variantId);
    // Also get product-level measurements that don't have a variant ID
    const productMeasurements = initialMeasurements.filter(m => !m.variantId);
    
    // Return variant measurements + product measurements as fallback
    return variantMeasurements.length > 0 ? variantMeasurements : productMeasurements;
  }, [initialMeasurements]);
  
  // Function to fetch measurements from API - wrapped in useCallback
  const fetchMeasurementsFromAPI = useCallback(async (productId: string, variantId: string) => {
    if (!productId || !variantId) return false;
    
    setIsLoading(true);
    try {
      const data = await getProductMeasurements(productId, variantId, locale);
      setMeasurements(data);
      return true;
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [locale, setIsLoading, setMeasurements]);
  
  // Debounced variant change handler to prevent excessive API calls
  const debouncedVariantChangeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update measurements when variant changes with debouncing
  useEffect(() => {
    if (!productId || !selectedVariantId) return;
    
    // Clear any pending debounced calls
    if (debouncedVariantChangeRef.current) {
      clearTimeout(debouncedVariantChangeRef.current);
    }
    
    // IMMEDIATE: First try to use local data for instant feedback
    const localMeasurements = findVariantMeasurements(selectedVariantId);
    if (localMeasurements.length > 0) {
      setMeasurements(localMeasurements);
      return; // Don't make API call if we have local data
    }
    
    // DEBOUNCED: Only fetch from API if we don't have local data
    debouncedVariantChangeRef.current = setTimeout(() => {
      startTransition(() => {
        fetchMeasurementsFromAPI(productId, selectedVariantId);
      });
    }, 300); // 300ms debounce
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (debouncedVariantChangeRef.current) {
        clearTimeout(debouncedVariantChangeRef.current);
      }
    };
    
  }, [productId, selectedVariantId, locale, findVariantMeasurements, fetchMeasurementsFromAPI]);
  
 
  
  // Get title for the accordion based on locale
  const accordionTitle = locale === 'pl' ? 'Wymiary' : 'Dimensions';
  
  // No measurements to display at all
  if (!measurements || measurements.length === 0) {
    if (isLoading) {
      return (
        <div className="m-0">
          <ProductPageAccordion
            heading={accordionTitle}
            defaultOpen={false}
          >
            <div className="w-full py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ui-border-interactive"></div>
            </div>
          </ProductPageAccordion>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="m-0">
      <ProductPageAccordion
        heading={accordionTitle}
        defaultOpen={false}
      >
        {/* Show measurements for the current selected variant */}
        {measurements.map((measurement: SingleProductMeasurement) => (
          <ProdutMeasurementRow
            key={`${measurement.label}-${measurement.variantId || 'product'}`}
            measurement={measurement}
          />
        ))}
      </ProductPageAccordion>
    </div>
  );
};
