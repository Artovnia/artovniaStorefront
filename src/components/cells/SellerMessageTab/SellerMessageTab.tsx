"use client"

import { useEffect, useState } from "react"
import { MessageForm } from "./MessageForm"

// Client component that works with both App Router and Pages Router
export const SellerMessageTab = ({
  seller_id,
  seller_name,
  isAuthenticated = false,
}: {
  seller_id: string
  seller_name: string
  isAuthenticated?: boolean
}) => {
  // Log authentication status for debugging
  useEffect(() => {
    
  }, [isAuthenticated])

  return (
    <div className="grid grid-cols-1 mt-8">
      <div className="border rounded-sm p-6 ring-1 ring-[#3B3634]">
        <h3 className="heading-sm uppercase border-b pb-4 mb-6">Napisz wiadomość do {seller_name}</h3>
        
        {/* Conditionally render the message form based on authentication status */}
        <MessageForm 
          seller_id={seller_id} 
          seller_name={seller_name} 
          isAuthenticated={isAuthenticated} 
        />
      </div>
    </div>
  )
}