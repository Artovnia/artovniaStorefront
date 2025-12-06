"use client"

import { useState, useCallback, useEffect } from "react"
import { InpostParcelData } from "../services/inpost-api"
import { isInpostShippingOption, extractParcelDataFromShippingMethod } from "../helpers/inpost-helpers"
import { HttpTypes } from "@medusajs/types"
import { setShippingMethod } from "../data/cart"

/**
 * Custom hook for managing InPost parcel selection
 */
export function useInpostParcelSelection() {
  // State for selected shipping method
  const [currentShippingMethod, setCurrentShippingMethod] = useState<HttpTypes.StoreCartShippingMethod | null>(null)
  
  // State for selected parcel data
  const [selectedParcel, setSelectedParcel] = useState<InpostParcelData | null>(null)
  
  // State for tracking if we need to show the parcel selector
  const [showParcelSelector, setShowParcelSelector] = useState<boolean>(false)
  
  // State for tracking loading
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // State for tracking errors
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle shipping method selection
   */
  const handleShippingMethodSelected = useCallback((shippingMethod: HttpTypes.StoreCartShippingMethod | null) => {
    setCurrentShippingMethod(shippingMethod)
    
    // Reset parcel data if shipping method is not InPost
    if (!shippingMethod || !isInpostShippingOption(shippingMethod)) {
      setSelectedParcel(null)
      setShowParcelSelector(false)
      return
    }
    
    // Extract parcel data if available
    const parcelData = extractParcelDataFromShippingMethod(shippingMethod)
    setSelectedParcel(parcelData)
    
    // Show parcel selector if shipping method is InPost and no parcel is selected
    if (isInpostShippingOption(shippingMethod) && !parcelData) {
      setShowParcelSelector(true)
    } else {
      setShowParcelSelector(false)
    }
  }, [])
  
  /**
   * Handle parcel selection
   */
  const handleParcelSelected = useCallback(async (parcelData: InpostParcelData) => {
    if (!currentShippingMethod) {
      setError("No shipping method selected")
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      setSelectedParcel(parcelData)
      setShowParcelSelector(false)
      
      // Logic to update the shipping method with the parcel data will be here
      // This will be called after a shipping method is selected and a parcel is chosen
     
      
      // Note: The actual shipping method update will be handled by the parent component
      // as it involves more context about the cart and shipping options
    } catch (err) {
      console.error('Error setting parcel data:', err)
      setError('Failed to set parcel data')
    } finally {
      setIsLoading(false)
    }
  }, [currentShippingMethod])
  
  /**
   * Reset the parcel selection state
   */
  const resetParcelSelection = useCallback(() => {
    setSelectedParcel(null)
    setShowParcelSelector(false)
    setError(null)
  }, [])

  return {
    currentShippingMethod,
    selectedParcel,
    showParcelSelector,
    isLoading,
    error,
    handleShippingMethodSelected,
    handleParcelSelected,
    setShowParcelSelector,
    resetParcelSelection
  }
}
