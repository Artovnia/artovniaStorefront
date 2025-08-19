"use client"

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SellerAvatar } from '@/components/cells/SellerAvatar/SellerAvatar'

import { SellerProps } from '@/types/seller'

interface SellerCardProps {
  seller: SellerProps
  className?: string
}

export const SellerCard = ({ seller, className }: SellerCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <Link 
      href={`/sellers/${seller.handle}`}
      className={cn(
        "group block bg-white border border-[#3B3634] rounded-lg overflow-hidden max-w-[200px]",
        "hover:shadow-lg hover:border-primary transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      {/* Logo Section - Round */}
      <div className="flex items-center justify-center p-3">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <SellerAvatar 
            photo={seller.photo}  
            size={64}   
            alt={`${seller.name} logo`}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-black group-hover:text-primary transition-colors font-instrument-sans line-clamp-1 text-center">
          {seller.name}
        </h3>
        
        {seller.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-instrument-sans text-center">
            {seller.description}
          </p>
        )}

        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 font-instrument-sans">
            Od {formatDate(seller.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
