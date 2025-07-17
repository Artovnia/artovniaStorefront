/**
 * ProductGPSRData type definition
 * This matches the structure stored in product metadata for GPSR (General Product Safety Regulation) information
 */
export type ProductGPSRData = {
  producerName: string;
  producerAddress: string;
  producerContact: string;
  importerName?: string;
  importerAddress?: string;
  importerContact?: string;
  instructions: string;
  certificates?: string;
}
