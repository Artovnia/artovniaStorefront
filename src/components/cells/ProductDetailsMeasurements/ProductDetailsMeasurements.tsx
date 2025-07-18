'use client';

import {
  ProductPageAccordion,
  ProdutMeasurementRow,
} from '@/components/molecules';
import { SingleProductMeasurement } from '@/types/product';
import { useEffect, useMemo, useState, useTransition } from 'react';
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
  
  // Helper function to find measurements for a specific variant
  const findVariantMeasurements = (variantId: string) => {
    // Check if we have measurements for this variant in our data already
    const variantMeasurements = initialMeasurements.filter(m => m.variantId === variantId);
    // Also get product-level measurements that don't have a variant ID
    const productMeasurements = initialMeasurements.filter(m => !m.variantId);
    
    // Return variant measurements + product measurements as fallback
    return variantMeasurements.length > 0 ? variantMeasurements : productMeasurements;
  };
  
  // Function to fetch measurements from API
  const fetchMeasurementsFromAPI = async (productId: string, variantId: string) => {
    if (!productId || !variantId) return false;
    
    setIsLoading(true);
    try {
      console.log(`API: Fetching measurements for variant: ${variantId}`);
      const data = await getProductMeasurements(productId, variantId, locale);
      console.log(`API: Received ${data.length} measurements for variant ${variantId}`);
      setMeasurements(data);
      return true;
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update measurements when variant changes
  useEffect(() => {
    if (!productId || !selectedVariantId) return;
    
    console.log(`MEASUREMENTS: Processing variant change to ${selectedVariantId}`);
    
    // IMMEDIATE: First try to use local data for instant feedback
    const localMeasurements = findVariantMeasurements(selectedVariantId);
    if (localMeasurements.length > 0) {
      console.log(`IMMEDIATE: Using ${localMeasurements.length} local measurements for variant ${selectedVariantId}`);
      setMeasurements(localMeasurements);
    }
    
    // BACKGROUND: Then fetch fresh data from API
    startTransition(() => {
      fetchMeasurementsFromAPI(productId, selectedVariantId);
    });
    
  }, [productId, selectedVariantId, locale, findVariantMeasurements, fetchMeasurementsFromAPI]);
  
  console.log('ProductDetailsMeasurements rendering with:', {
    measurementsCount: measurements.length,
    locale,
    variantsCount: variants.length,
    selectedVariantId,
    measurementsWithVariantId: measurements.filter(m => m.variantId === selectedVariantId).length,
    measurementsWithoutVariantId: measurements.filter(m => !m.variantId).length,
    allMeasurements: measurements.map(m => ({
      label: m.label,
      variantId: m.variantId || 'product'
    }))
  });
  
  // Get title for the accordion based on locale
  const accordionTitle = locale === 'pl' ? 'Wymiary' : 'Dimensions';
  
  // No measurements to display at all
  if (!measurements || measurements.length === 0) {
    if (isLoading) {
      return (
        <div className="m-0">
          <ProductPageAccordion
            heading={accordionTitle}
            defaultOpen={true}
          >
            <div className="w-full py-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ui-border-interactive"></div>
            </div>
          </ProductPageAccordion>
        </div>
      );
    }
    console.log('No measurements to display');
    return null;
  }

  return (
    <div className="m-0">
      <ProductPageAccordion
        heading={accordionTitle}
        defaultOpen={true}
      >
        {/* Show measurements for the current selected variant */}
        {measurements.map((measurement: SingleProductMeasurement) => (
          <ProdutMeasurementRow
            key={`${measurement.label}-${measurement.variantId || 'product'}`}
            measurement={measurement}
          />
        ))}
        
        {/* Show a subtle loading indicator when refreshing measurements */}
        {(isLoading || isPending) && (
          <div className="flex justify-end items-center py-2 px-4 text-xs text-gray-500">
            <div className="animate-spin h-3 w-3 mr-2 border-b-1 border-gray-400 rounded-full"></div>
            Aktualizowanie...
          </div>
        )}
      </ProductPageAccordion>
    </div>
  );
};
