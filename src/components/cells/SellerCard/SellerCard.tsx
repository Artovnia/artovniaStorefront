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
        "group block bg-gradient-to-br from-[#F4F0EB] via-[#F4F0EB] to-[#F4F0EB]/95",
        "rounded-3xl overflow-hidden w-[240px] h-[320px]",
        "border border-[#BFB7AD]/20 shadow-md",
        "hover:shadow-2xl hover:shadow-[#3B3634]/15 hover:border-[#BFB7AD]/50",
        "hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-[#BFB7AD] focus:ring-offset-2",
        "relative backdrop-blur-sm",
        className
      )}
    >
      {/* Subtle gradient overlays and accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#BFB7AD]/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BFB7AD]/30 to-transparent" />
      
      {/* Avatar Section - Fixed height */}
      <div className="relative flex items-center justify-center pt-8 pb-6 h-[120px]">
        {/* Container for ring and avatar - same size */}
        <div className="relative w-18 h-18">
          {/* Decorative rings - same size as avatar container */}
          <div className="absolute inset-0 w-18 h-18 rounded-md border border-[#BFB7AD]/15" />
          <div className="absolute inset-0 w-18 h-18 rounded-md border border-[#BFB7AD]/25 animate-pulse" 
               style={{ animationDuration: '3s' }} />
          
          {/* Avatar container - same size as rings */}
          <div className="relative w-18 h-18 rounded-md overflow-hidden bg-gradient-to-br from-white/60 to-[#BFB7AD]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl ring-2 ring-white/50">
            <SellerAvatar 
              photo={seller.photo}  
              size={72}   
              alt={`${seller.name} avatar`}
            />
          </div>
        </div>
      </div>

      {/* Content Section - Fixed positioning */}
      <div className="px-6 pb-6 flex flex-col justify-between h-[200px]">
        {/* Seller Name - Fixed height */}
        <div className="h-[60px] flex items-center justify-center">
          <h3 className="font-instrument-serif text-xl font-semibold text-[#3B3634] group-hover:text-[#3B3634] transition-colors text-center leading-tight">
            {seller.name}
          </h3>
        </div>
        
        {/* Description - Fixed height */}
        <div className="h-[60px] flex items-center justify-center">
          {seller.description ? (
            <p className="font-instrument-sans text-sm text-[#3B3634]/90 line-clamp-3 text-center leading-relaxed">
              {seller.description}
            </p>
          ) : (
            <p className="font-instrument-sans text-sm text-[#3B3634]/90 italic text-center">
              Artysta rękodzieła
            </p>
          )}
        </div>

        {/* Date Badge - Fixed position */}
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#BFB7AD]/10 to-[#BFB7AD]/20 border border-[#BFB7AD]/30 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#BFB7AD]/50 mr-2 group-hover:bg-[#BFB7AD] transition-colors" />
            <span className="font-instrument-sans text-xs text-[#3B3634]/90 font-medium">
              Od {formatDate(seller.created_at)}
            </span>
          </div>
        </div>

        {/* Bottom decorative accent */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#BFB7AD]/50 to-transparent rounded-full" />
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-[#BFB7AD]/30 to-transparent rounded-full mt-1 mx-auto" />
        </div>
      </div>
    </Link>
  )
}