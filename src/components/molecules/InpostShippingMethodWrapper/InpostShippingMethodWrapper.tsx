"use client"

import React, { useState, useCallback } from "react"
import { InpostParcelSelector } from "../InpostParcelSelector/InpostParcelSelector"
import { InpostParcelInfo } from "../InpostParcelInfo/InpostParcelInfo"
import { InpostParcelData } from "@/lib/services/inpost-api"
import { isInpostShippingOption, createInpostShippingData, extractParcelDataFromShippingMethod } from "@/lib/helpers/inpost-helpers"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { Text } from "@medusajs/ui"
import { updateShippingMethodData } from "@/lib/data/cart"
// Remove the revalidateTag import since we can't use it from client components

type InpostShippingMethodWrapperProps = {
  shippingMethod: HttpTypes.StoreCartShippingMethod
  sellerId: string | undefined
  cartId?: string
  onComplete?: () => void
  onError?: (error: string) => void
}

export const InpostShippingMethodWrapper: React.FC<InpostShippingMethodWrapperProps> = ({
  shippingMethod,
  sellerId,
  cartId,
  onComplete,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedParcel, setSelectedParcel] = useState<InpostParcelData | null>(() => {
    // Initialize from shipping method data if available
    if (shippingMethod.data?.parcel_machine) {
      const machine = shippingMethod.data.parcel_machine as Record<string, string>
      return {
        machineId: machine.id || '',
        machineName: machine.name || '',
        machineAddress: machine.address || '',
        machinePostCode: machine.postal_code || '',
        machineCity: machine.city || ''
      }
    }
    return null
  })
  const [showParcelSelector, setShowParcelSelector] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check if this shipping method is an InPost method
  const isInpostMethod = isInpostShippingOption(shippingMethod)

  /**
   * Update the shipping method with the selected parcel data using our data-specific endpoint
   */
  const updateShippingMethodWithParcelData = async (shippingMethod: HttpTypes.StoreCartShippingMethod, parcelData: InpostParcelData): Promise<void> => {
    try {
      // Create shipping data object with parcel machine details
      const shippingData = createInpostShippingData(parcelData);
      
      // Important: Use the shipping method ID, not the shipping option ID
      // The shipping method ID is the unique ID for the specific shipping method on this cart
      const shippingMethodId = shippingMethod.id;
      
      // Use our new direct data update function that bypasses the cart validation
      // The revalidateTag is handled inside the server action
      await updateShippingMethodData({
        shippingMethodId,
        data: shippingData,
      });
      
      // Don't call revalidateTag here - it's handled by the server action
    } catch (error: unknown) {
      console.error('Error updating shipping method data:', error);
      throw error;
    }
  }

  const handleParcelSelected = useCallback(async (parcelData: InpostParcelData) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Store the selected parcel data in local state
      setSelectedParcel(parcelData);
      
      // Close the selector
      setShowParcelSelector(false);
      
      // Update the shipping method with the parcel data
      await updateShippingMethodWithParcelData(shippingMethod, parcelData);
      
      // Notify parent of completion
      if (onComplete) {
        onComplete();
      }
    } catch (err: unknown) {
      console.error('Error handling parcel selection:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      
      // Notify parent component of error
      if (onError && err instanceof Error) {
        onError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [shippingMethod, onComplete, onError]);
  
  // Method to get the parcel data (accessible to parent components)
  const getParcelData = useCallback((): Record<string, any> | null => {
    return selectedParcel ? createInpostShippingData(selectedParcel) : null;
  }, [selectedParcel]);

  // If not an InPost method, return null
  if (!isInpostMethod) {
    return null
  }

  // If we have a selected parcel and we're not showing the selector, display the parcel info
  if (selectedParcel && !showParcelSelector) {
    return (
      <div className="mt-2">
        <InpostParcelInfo parcelData={selectedParcel} />
        <Button 
          onClick={() => setShowParcelSelector(true)}
          variant="tonal"
          className="mt-2 text-sm"
        >
          Zmień paczkomat
        </Button>
        {errorMessage && (
          <Text className="text-red-500 text-sm mt-2">
            {errorMessage}
          </Text>
        )}
      </div>
    )
  }

  // If we need to show the selector but it's not shown yet, show a button to show it
  if (!showParcelSelector) {
    return (
      <div className="mt-3">
        <Text className="text-sm mb-2 text-ui-fg-subtle">
          Aby skorzystać z dostawy do paczkomatu, wybierz paczkomat.
        </Text>
        <Button 
          onClick={() => setShowParcelSelector(true)}
          variant="filled"
          loading={isLoading}
        >
          Wybierz paczkomat
        </Button>
        {errorMessage && (
          <Text className="text-red-500 text-sm mt-2">
            {errorMessage}
          </Text>
        )}
      </div>
    )
  }

  // Otherwise show the parcel selector
  return (
    <div className="mt-3">
      <InpostParcelSelector 
        onSelect={handleParcelSelected} 
        initialValue={selectedParcel}
      />
      {errorMessage && (
        <Text className="text-red-500 text-sm mt-2">
          {errorMessage}
        </Text>
      )}
    </div>
  )
}

export default InpostShippingMethodWrapper