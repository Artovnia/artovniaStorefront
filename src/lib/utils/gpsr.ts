// src/lib/utils/gpsr.ts
import { HttpTypes } from "@medusajs/types"
import { ProductGPSRData } from "@/types/gpsr"

/**
 * Extract GPSR data from product metadata
 * @param product - The product object containing metadata
 * @returns The formatted GPSR data or null if not available
 */
export const getGPSRFromProductData = (product?: HttpTypes.StoreProduct): ProductGPSRData | null => {
  if (!product?.metadata) {
    return null
  }

  const metadata = product.metadata

  // Check if any GPSR data exists in metadata
  const hasGPSRData = [
    'gpsr_producer_name',
    'gpsr_producer_address',
    'gpsr_producer_contact',
    'gpsr_instructions'
  ].some(key => !!metadata[key])

  if (!hasGPSRData) {
    return null
  }

  // Extract and return GPSR data
  return {
    producerName: metadata.gpsr_producer_name as string || '',
    producerAddress: metadata.gpsr_producer_address as string || '',
    producerContact: metadata.gpsr_producer_contact as string || '',
    importerName: metadata.gpsr_importer_name as string || '',
    importerAddress: metadata.gpsr_importer_address as string || '',
    importerContact: metadata.gpsr_importer_contact as string || '',
    instructions: metadata.gpsr_instructions as string || '',
    certificates: metadata.gpsr_certificates as string || '',
  }
}