// src/components/molecules/ProductGPSR/ProductGPSR.tsx
'use client';

import { ProductPageAccordion } from '@/components/molecules';
import { HttpTypes } from '@medusajs/types';
import { getGPSRFromProductData } from '@/lib/utils/gpsr';

/**
 * Component to display GPSR (General Product Safety Regulation) information
 * Uses ProductPageAccordion to match other product detail sections
 */
export const ProductGPSR = ({ product }: { product: HttpTypes.StoreProduct }) => {
  // Fetch GPSR data from product metadata
  const gpsrData = getGPSRFromProductData(product);
  
  // If no GPSR data is available, don't render anything
  if (!gpsrData) {
    return null;
  }
  
  // Define which sections have data to display
  const hasProducerInfo = gpsrData.producerName || gpsrData.producerAddress || gpsrData.producerContact;
  const hasImporterInfo = gpsrData.importerName || gpsrData.importerAddress || gpsrData.importerContact;
  const hasInstructions = !!gpsrData.instructions;
  const hasCertificates = !!gpsrData.certificates;
  
  // Don't render if there's no data to show
  if (!hasProducerInfo && !hasImporterInfo && !hasInstructions && !hasCertificates) {
    return null;
  }
  
  return (
    <ProductPageAccordion heading="Informacje o produkcie (GPSR)" defaultOpen={false}>
      <div className="space-y-6 divide-y divide-gray-200 select-none" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}>
        {/* Producer Information */}
        {hasProducerInfo && (
          <div className="py-4">
            <h4 className="font-semibold mb-3 text-ui-fg-base">Producent</h4>
            <div className="space-y-2">
              {gpsrData.producerName && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Nazwa firmy:</span>
                  <span>{gpsrData.producerName}</span>
                </div>
              )}
              {gpsrData.producerAddress && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Adres:</span>
                  <span className="whitespace-pre-wrap">{gpsrData.producerAddress}</span>
                </div>
              )}
              {gpsrData.producerContact && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Kontakt:</span>
                  <span>{gpsrData.producerContact}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Importer Information */}
        {hasImporterInfo && (
          <div className="py-4">
            <h4 className="font-semibold mb-3 text-ui-fg-base">Importer</h4>
            <div className="space-y-2">
              {gpsrData.importerName && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Nazwa firmy:</span>
                  <span>{gpsrData.importerName}</span>
                </div>
              )}
              {gpsrData.importerAddress && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Adres:</span>
                  <span className="whitespace-pre-wrap">{gpsrData.importerAddress}</span>
                </div>
              )}
              {gpsrData.importerContact && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Kontakt:</span>
                  <span>{gpsrData.importerContact}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        {hasInstructions && (
          <div className="py-4">
            <h4 className="font-semibold mb-3 text-ui-fg-base">Instrukcje i ostrzeżenia</h4>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Informacje bezpieczeństwa:</span>
              <p className="whitespace-pre-wrap">{gpsrData.instructions}</p>
            </div>
          </div>
        )}
        
        {/* Certificates */}
        {hasCertificates && (
          <div className="py-4">
            <h4 className="font-semibold mb-3 text-ui-fg-base">Certyfikaty</h4>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Dokumenty zgodności:</span>
              <p className="whitespace-pre-wrap">{gpsrData.certificates}</p>
            </div>
          </div>
        )}
      </div>
    </ProductPageAccordion>
  );
};