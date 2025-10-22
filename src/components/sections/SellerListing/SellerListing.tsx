"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SellerCard } from '@/components/cells/SellerCard/SellerCard'
import { SellerFilterBar } from '@/components/organisms/SellerFilterBar/SellerFilterBar'
import { useSearchParams } from 'next/navigation'
import { getSellers } from '@/lib/data/seller'
import { SellerProps } from '@/types/seller'
import { Pagination } from '@/components/cells/Pagination/Pagination'

interface SellerListingResponse {
  sellers: SellerProps[]
  count: number
  limit: number
  offset: number
}

interface SellerListingProps {
  className?: string
}

const SellerListingSkeleton = () => (
  <div className="w-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
      {Array.from({ length: 12 }).map((_, index) => (
        <div 
          key={index} 
          className="bg-gradient-to-br from-[#F4F0EB] via-[#F4F0EB] to-[#F4F0EB]/95 rounded-3xl overflow-hidden w-[240px] h-[320px] border border-[#BFB7AD]/20 shadow-md animate-pulse relative"
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#BFB7AD]/5" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#BFB7AD]/20 to-transparent" />
          
          {/* Avatar Section */}
          <div className="relative flex items-center justify-center pt-8 pb-6 h-[120px]">
            {/* Container for ring and avatar placeholder */}
            <div className="relative w-18 h-18">
              {/* Decorative rings */}
              <div className="absolute inset-0 w-18 h-18 rounded-md border border-[#BFB7AD]/10" />
              {/* Avatar placeholder */}
              <div className="w-18 h-18 rounded-md bg-[#BFB7AD]/20 shadow-xl ring-2 ring-white/50" />
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 pb-6 flex flex-col justify-between h-[200px]">
            {/* Name placeholder */}
            <div className="h-[60px] flex items-center justify-center">
              <div className="h-6 bg-[#BFB7AD]/30 rounded-lg w-32" />
            </div>
            
            {/* Description placeholder */}
            <div className="h-[60px] flex items-center justify-center flex-col space-y-2">
              <div className="h-4 bg-[#BFB7AD]/20 rounded w-40" />
              <div className="h-4 bg-[#BFB7AD]/15 rounded w-32" />
            </div>

            {/* Badge placeholder */}
            <div className="flex justify-center">
              <div className="h-8 bg-[#BFB7AD]/25 rounded-full w-28" />
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-0.5 bg-[#BFB7AD]/30 rounded-full" />
              <div className="w-8 h-0.5 bg-[#BFB7AD]/20 rounded-full mt-1 mx-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SellerListing = ({ className }: SellerListingProps) => {
  const [sellers, setSellers] = useState<SellerProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  const searchParams = useSearchParams()
  const limit = 20

  // Get filter parameters
  const letter = searchParams.get("letter") || ""
  const sortBy = searchParams.get("sortBy") || ""

  const fetchSellers = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      const offset = (page - 1) * limit
      const params = {
        limit,
        offset,
        ...(letter && { letter }),
        ...(sortBy && { sortBy })
      }

      const data = await getSellers(params)
      
      setSellers(data.sellers || [])
      setTotalCount(data.count || 0)
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching sellers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sellers')
      setSellers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch sellers when filters change
  useEffect(() => {
    setCurrentPage(1)
    fetchSellers(1)
  }, [letter, sortBy])

  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchSellers(page)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <SellerFilterBar />
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-2 font-instrument-sans">
            Wystąpił błąd
          </h2>
          <p className="text-gray-600 font-instrument-sans">{error}</p>
          <button
            onClick={() => fetchSellers(currentPage)}
            className="mt-4 px-4 py-2 bg-primary text-black rounded-lg hover:bg-opacity-90 transition-colors font-instrument-sans"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Filter Bar */}
      <SellerFilterBar />

      {/* Results Info */}
      <div className="px-4 sm:px-6 py-4 bg-primary max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 font-instrument-sans">
            {loading ? (
              "Ładowanie..."
            ) : (
              <>
                Znaleziono {totalCount} sprzedawc{totalCount === 1 ? 'a' : totalCount < 5 ? 'ów' : 'ów'}
                {letter && ` na literę "${letter}"`}
              </>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-sm text-gray-600 font-instrument-sans">
              Strona {currentPage} z {totalPages}
            </p>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 py-8 max-w-[1200px] mx-auto">
        {loading ? (
          <SellerListingSkeleton />
        ) : sellers.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-800 mb-2 font-instrument-sans">
              Brak wyników
            </h2>
            <p className="text-gray-600 font-instrument-sans">
              {letter 
                ? `Nie znaleziono sprzedawców zaczynających się na literę "${letter}"`
                : "Nie znaleziono żadnych sprzedawców"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Sellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center mb-8">
              {sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination 
                  pages={totalPages} 
                  setPage={handlePageChange} 
                  currentPage={currentPage} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}