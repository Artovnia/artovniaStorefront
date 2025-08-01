"use client"

import { HttpTypes } from "@medusajs/types"
import { InpostParcelData } from "../services/inpost-api"

/**
 * Identifies if a shipping option is an InPost parcel locker option
 * @param shippingOption The shipping option to check
 * @returns true if the shipping option is for InPost paczkomat specifically
 */
export function isInpostShippingOption(shippingOption: HttpTypes.StoreCartShippingMethod | undefined): boolean {
  if (!shippingOption) return false
  
  // Check for specific "Inpost paczkomat" combination (case insensitive)
  const nameCheck = shippingOption.name?.toLowerCase().includes('inpost') && 
                   shippingOption.name?.toLowerCase().includes('paczkomat')
  
  // Check for InPost in the data type
  const dataCheck = shippingOption.data?.type === 'inpost' ||
                   shippingOption.data?.provider === 'inpost' ||
                   // Sometimes data may contain service_zone info
                   // Type assertion to avoid TypeScript error with unknown structure
                   (shippingOption.data && 'service_zone' in shippingOption.data && 
                    typeof shippingOption.data.service_zone === 'object' && 
                    shippingOption.data.service_zone !== null && 
                    'fulfillment_set' in (shippingOption.data.service_zone as any) && 
                    (shippingOption.data.service_zone as any).fulfillment_set?.type === 'inpost')
  
  // Check shipping option ID if it contains inpost identifier
  const idCheck = !!shippingOption.shipping_option_id && 
                 shippingOption.shipping_option_id.toLowerCase().includes('inpost')
  
  return nameCheck || dataCheck || !!idCheck // Force boolean conversion
}

/**
 * Updates shipping option data with InPost parcel information
 * @param shippingOptionId The shipping option ID
 * @param parcelData The InPost parcel data
 * @returns The shipping option data with InPost parcel information
 */
export function createInpostShippingData(
  parcelData: InpostParcelData
): Record<string, any> {
  return {
    type: 'inpost',
    provider: 'inpost',
    parcel_machine: {
      id: parcelData.machineId,
      name: parcelData.machineName,
      address: parcelData.machineAddress,
      postal_code: parcelData.machinePostCode,
      city: parcelData.machineCity
    },
    // We preserve these fields for display purposes
    display_address: `${parcelData.machineName}, ${parcelData.machineAddress}, ${parcelData.machinePostCode} ${parcelData.machineCity}`
  }
}

/**
 * Extracts InPost parcel data from shipping method data if available
 * @param shippingMethod The shipping method
 * @returns InPost parcel data or null if not available
 */
export function extractParcelDataFromShippingMethod(
  shippingMethod: HttpTypes.StoreCartShippingMethod | undefined
): InpostParcelData | null {
  if (!shippingMethod || !shippingMethod.data?.parcel_machine) {
    return null
  }

  const parcelMachine = shippingMethod.data.parcel_machine as Record<string, string>
  
  return {
    machineId: parcelMachine.id || '',
    machineName: parcelMachine.name || '',
    machineAddress: parcelMachine.address || '',
    machinePostCode: parcelMachine.postal_code || '',
    machineCity: parcelMachine.city || ''
  }
}