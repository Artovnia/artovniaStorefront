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
  initialSellers?: SellerProps[]
  initialCount?: number
  initialPage?: number
  limit?: number
  className?: string
}

const SellerListingSkeleton = () => (
  <div className="w-full pt-2 xl:pt-24 pb-12 xl:pb-24">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center  pt-2 xl:pt-24 pb-12 xl:pb-24">
      {Array.from({ length: 12 }).map((_, index) => (
        <div 
          key={index} 
          className="w-[252px] h-[380px] bg-primary shadow-md animate-pulse"
        >
          {/* Top 60% - Image skeleton */}
          <div className="h-[60%] bg-[#F4F0EB]" />
          
          {/* Bottom 40% - Content skeleton */}
          <div className="h-[40%] bg-primary p-4 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center items-center gap-2">
              <div className="h-5 bg-[#BFB7AD]/30 rounded w-32" />
              <div className="h-3 bg-[#BFB7AD]/20 rounded w-40" />
            </div>
            <div className="flex justify-center pt-2">
              <div className="h-2 bg-[#BFB7AD]/15 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SellerListing = ({ 
  initialSellers = [],
  initialCount = 0,
  initialPage = 1,
  limit = 20,
  className 
}: SellerListingProps) => {
  // ✅ OPTIMIZATION: Use initial data from server
  const [sellers, setSellers] = useState<SellerProps[]>(initialSellers)
  const [loading, setLoading] = useState(false)  // ✅ Start as false
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  
  const searchParams = useSearchParams()

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

  // Set initial data when props change
  useEffect(() => {
    setSellers(initialSellers)
    setTotalCount(initialCount)
    setCurrentPage(initialPage)
  }, [initialSellers, initialCount, initialPage])

  // ✅ PERFORMANCE: Fetch sellers only when filters change AND we don't have matching data
  useEffect(() => {
    // Skip if we have initial data that matches current filters
    // This prevents unnecessary re-fetch on mount
    const hasMatchingInitialData = initialSellers.length > 0 && currentPage === initialPage
    if (hasMatchingInitialData) return
    
    setCurrentPage(1)
    fetchSellers(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className={cn("w-full ", className)}>
        <SellerFilterBar />
        <div className="text-center py-12 ">
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

    {/* Content Area */}
    <div className="max-w-[1200px] mx-auto pt-2 xl:pt-24 pb-12 xl:pb-24">
      {/* Results Info */}
      <div className="flex items-center justify-between mb-6">
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

      {/* Sellers Content */}
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
          <div className="grid grid-cols-2 xs:grid-cols-3 xs2:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 xs:gap-6 justify-items-center mb-8">
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