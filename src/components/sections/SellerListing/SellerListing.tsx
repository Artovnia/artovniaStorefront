"use client"

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { SellerCard } from '@/components/cells/SellerCard/SellerCard'
import { SellerFilterBar } from '@/components/organisms/SellerFilterBar/SellerFilterBar'
import { useSearchParams } from 'next/navigation'
import { getSellers } from '@/lib/data/seller'
import { SellerProps } from '@/types/seller'

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-white border border-[#3B3634] rounded-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
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
      <div className="px-4 sm:px-6 py-4 bg-primary border-b border-gray-200">
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
      <div className="px-4 sm:px-6 py-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
              {sellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium font-instrument-sans transition-colors",
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-black hover:bg-opacity-90"
                  )}
                >
                  Poprzednia
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-medium font-instrument-sans transition-colors",
                          currentPage === pageNum
                            ? "bg-[#3B3634] text-white"
                            : "bg-primary text-black hover:bg-opacity-90"
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium font-instrument-sans transition-colors",
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-black hover:bg-opacity-90"
                  )}
                >
                  Następna
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
