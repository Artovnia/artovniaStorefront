"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { XMark } from "@medusajs/icons"

// Import UI components from Medusa UI library instead of modules
import { Heading } from "@medusajs/ui"
import { Button } from "@medusajs/ui"
import { VendorHolidayMode } from "../../../lib/data/vendor-availability"

type HolidayModeModalProps = {
  holidayMode: VendorHolidayMode
  vendorName?: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal displayed when a vendor is on holiday mode
 */
export default function HolidayModeModal({ 
  holidayMode, 
  vendorName = "Sprzedawca", 
  isOpen, 
  onClose 
}: HolidayModeModalProps) {
  const formattedStartDate = holidayMode.holiday_start_date
    ? format(new Date(holidayMode.holiday_start_date), "dd.MM.yyyy", { locale: pl })
    : null
    
  const formattedEndDate = holidayMode.holiday_end_date
    ? format(new Date(holidayMode.holiday_end_date), "dd.MM.yyyy", { locale: pl })
    : null

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Modal position */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            aria-label="Zamknij"
          >
            <XMark />
          </button>
          
          {/* Title */}
          <Dialog.Title as="div" className="mb-4">
            <Heading level="h2" className="text-xl font-bold">
              Sprzedawca na urlopie
            </Heading>
          </Dialog.Title>
          
          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-700">
              {vendorName} jest obecnie na urlopie i tymczasowo nie realizuje zamówień.
            </p>
            
            {/* Show holiday message if available */}
            {holidayMode.holiday_message && (
              <div>
                <p className="font-medium mb-1">Wiadomość od sprzedawcy:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-md italic">
                  &quot;{holidayMode.holiday_message}&quot;
                </p>
              </div>
            )}
            
            {/* Show date information */}
            <div className="text-sm text-gray-600">
              {formattedStartDate && <p>Urlop rozpoczął się: {formattedStartDate}</p>}
              {formattedEndDate && <p>Planowany powrót: {formattedEndDate}</p>}
            </div>
          </div>
          
          {/* Action button */}
          <div className="mt-6">
            <Button
              variant="secondary"
              size="base"
              className="w-full"
              onClick={onClose}
            >
              Rozumiem
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
