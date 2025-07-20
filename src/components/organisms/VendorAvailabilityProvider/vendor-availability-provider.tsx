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
    
  // Log availability state for debugging
  useEffect(() => {
    if (availability) {
      console.log('DEBUG - VendorAvailabilityProvider received availability:', {
        vendorId,
        available: availability.available,
        suspended: availability.suspended,
        onHoliday: availability.onHoliday,
        status: availability.status,
        isAvailable
      })
    }
    
    if (holidayMode) {
      console.log('DEBUG - VendorAvailabilityProvider received holidayMode:', {
        is_holiday_mode: holidayMode.is_holiday_mode,
        start: holidayMode.holiday_start_date,
        end: holidayMode.holiday_end_date,
        status: holidayMode.status
      })
    }
  }, [availability, holidayMode, vendorId, isAvailable])
  
  // Show holiday modal on initial load if requested and vendor is on holiday
  useEffect(() => {
    console.log('DEBUG - Checking showModalOnLoad conditions:', {
      showModalOnLoad,
      'availability?.onHoliday': availability?.onHoliday,
      'holidayMode?.is_holiday_mode': holidayMode?.is_holiday_mode
    })
    
    if (showModalOnLoad && availability?.onHoliday && holidayMode?.is_holiday_mode) {
      console.log('DEBUG - Setting showHolidayModal to true (initial load)')
      setShowHolidayModal(true)
    }
  }, [showModalOnLoad, availability, holidayMode])
  
  // Auto-show holiday modal when availability changes and vendor is on holiday
  useEffect(() => {
    console.log('DEBUG - Checking auto-show conditions:', {
      'availability?.onHoliday': availability?.onHoliday,
      'holidayMode?.is_holiday_mode': holidayMode?.is_holiday_mode
    })
    
    if (availability?.onHoliday && holidayMode?.is_holiday_mode) {
      console.log('DEBUG - Auto-showing holiday modal')
      setShowHolidayModal(true)
    }
  }, [availability?.onHoliday, holidayMode?.is_holiday_mode])
  
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
