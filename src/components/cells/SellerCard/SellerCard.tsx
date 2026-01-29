"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowRightIcon } from '@/icons'
import { SellerProps } from '@/types/seller'
import { prefetchSellerData } from '@/lib/utils/prefetch-seller'

interface SellerCardProps {
  seller: SellerProps
  className?: string
}

export const SellerCard = ({ seller, className }: SellerCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long'
    })
  }

  // Use seller photo or logo_url, fallback to placeholder
  const sellerImage = seller.photo || seller.logo_url || '/placeholder.webp'
  
  // ✅ PERFORMANCE: Prefetch seller page data on hover for instant navigation
  const handleMouseEnter = () => {
    setIsHovered(true)
    // Prefetch both the route (RSC payload) and the actual API data
    router.prefetch(`/sellers/${seller.handle}`)
    prefetchSellerData(seller.handle)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // ✅ PERFORMANCE: Use native Link navigation instead of useTransition
  // This allows loading.tsx to show immediately without waiting for full page render

  return (
    <Link 
      href={`/sellers/${seller.handle}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group block relative w-[270px] h-[380px]",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2",
        className
      )}
      aria-label={`View seller: ${seller.name}`}
    >
      <article className="relative overflow-hidden h-full bg-primary shadow-md">
        {/* Top Section - Seller Image (60%) - Expands to 100% on hover */}
        <div className={`relative w-full overflow-hidden bg-[#F4F0EB] transition-all duration-500 ${
          isHovered ? 'h-full' : 'h-[60%]'
        }`}>
          {/* Inner container with padding to prevent logo cropping */}
          <div className="absolute inset-0 p-2 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={sellerImage}
                alt={`${seller.name} - sprzedawca`}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 270px) 100vw, 270px"
              />
            </div>
          </div>
          
          {/* Subtle gradient overlay on image for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
        </div>

        {/* Bottom Section - Content (40%) - Hides on hover */}
        <div className={`relative bg-primary p-4 flex flex-col justify-between transition-all duration-500 ${
          isHovered ? 'h-0 opacity-0' : 'h-[40%] opacity-100'
        }`}>
          {/* Decorative line at top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3B3634]/20 to-transparent" />
          
          <div className="flex-1 flex flex-col justify-center">
            {/* Seller Name */}
            <h3 className="font-instrument-serif text-lg font-semibold text-[#3B3634] mb-1.5 text-center leading-tight line-clamp-2">
              {seller.name}
            </h3>
            
            {/* Short Description */}
            {seller.description && (
              <p className="font-instrument-sans text-xs text-[#3B3634]/70 text-center line-clamp-2 leading-relaxed">
                {seller.description}
              </p>
            )}
          </div>

          {/* Date Badge at bottom */}
          <div className="flex justify-center pt-2">
            <time
              dateTime={seller.created_at}
              className="font-instrument-sans text-[10px] text-[#3B3634]/60 uppercase tracking-wider"
            >
              Od {formatDate(seller.created_at)}
            </time>
          </div>
        </div>

        {/* Hover Overlay - Full Content */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div
            className="text-center px-6 flex flex-col items-center gap-3 transform transition-transform duration-500"
            style={{
              transform: isHovered ? "translateY(0)" : "translateY(20px)",
            }}
          >
            {/* Seller Details on Hover */}
            <div className="text-white space-y-2">
              <h4 className="font-instrument-serif text-xl font-semibold">
                {seller.name}
              </h4>
              
              {seller.description && (
                <p className="text-sm line-clamp-4 font-instrument-sans opacity-90">
                  {seller.description}
                </p>
              )}
              
              <div className="flex flex-col gap-1 text-xs font-instrument-sans opacity-80">
                {seller.city && (
                  <p>📍 {seller.city}</p>
                )}
                <p>Od {formatDate(seller.created_at)}</p>
              </div>
            </div>
            
            {/* "Zobacz więcej" CTA */}
            <span className="text-white font-instrument-serif text-lg flex items-center gap-2 mt-2">
              Zobacz więcej
              <ArrowRightIcon size={20} color="white" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}