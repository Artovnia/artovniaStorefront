"use client"

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { VendorAvailability, VendorHolidayMode, VendorSuspension } from "../../../lib/data/vendor-availability"
import HolidayModeModal from "./holiday-mode-modal"

type VendorAvailabilityContextType = {
  isLoading: boolean
  availability: VendorAvailability | null
  holidayMode: VendorHolidayMode | null
  suspension: VendorSuspension | null
  isAvailable: boolean
  showHolidayModal: boolean
  openHolidayModal: () => void
  closeHolidayModal: () => void
}

const VendorAvailabilityContext = createContext<VendorAvailabilityContextType | null>(null)

export const useVendorAvailability = () => {
  const context = useContext(VendorAvailabilityContext)
  
  if (!context) {
    throw new Error("useVendorAvailability must be used within a VendorAvailabilityProvider")
  }
  
  return context
}

type VendorAvailabilityProviderProps = {
  children: ReactNode
  vendorId: string | null | undefined
  vendorName?: string
  availability?: VendorAvailability
  holidayMode?: VendorHolidayMode
  suspension?: VendorSuspension
  showModalOnLoad?: boolean
}

/**
 * Provides vendor availability context and renders the holiday mode modal
 * when appropriate
 */
export function VendorAvailabilityProvider({
  children,
  vendorId,
  vendorName,
  availability,
  holidayMode,
  suspension,
  showModalOnLoad = false,
}: VendorAvailabilityProviderProps) {
  const [isLoading, setIsLoading] = useState(!availability)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  
  // Determine if vendor is available for purchasing
  const isAvailable = availability ? 
    availability.available && !availability.suspended && !availability.onHoliday : 
    true
    
  // Simplified useEffect to prevent infinite re-renders
  useEffect(() => {
    // Only run once when component mounts or when vendorId changes
    if (availability) {
      setIsLoading(false)
    }
    
    // Show holiday modal if conditions are met (only on mount/vendorId change)
    if (showModalOnLoad && availability?.onHoliday && holidayMode?.is_holiday_mode) {
      setShowHolidayModal(true)
    } else if (availability?.onHoliday && holidayMode?.is_holiday_mode) {
      setShowHolidayModal(true)
    }
  }, [vendorId]) // Only depend on vendorId to prevent infinite loops
  
  const openHolidayModal = () => {
    if (availability?.onHoliday && holidayMode) {
      setShowHolidayModal(true)
    }
  }
  
  const closeHolidayModal = () => {
    setShowHolidayModal(false)
  }
  
  const contextValue: VendorAvailabilityContextType = {
    isLoading,
    availability: availability || null,
    holidayMode: holidayMode || null,
    suspension: suspension || null,
    isAvailable,
    showHolidayModal,
    openHolidayModal,
    closeHolidayModal,
  }
  
  return (
    <VendorAvailabilityContext.Provider value={contextValue}>
      {children}
      
      {/* Render holiday mode modal if vendor has holiday mode enabled */}
      {holidayMode && holidayMode.is_holiday_mode && (
        <HolidayModeModal
          holidayMode={holidayMode}
          vendorName={vendorName}
          isOpen={showHolidayModal}
          onClose={closeHolidayModal}
        />
      )}
    </VendorAvailabilityContext.Provider>
  )
}
