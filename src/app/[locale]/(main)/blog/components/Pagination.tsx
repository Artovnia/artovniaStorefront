"use client"

import { useState } from "react"
import { PaginationButton } from "@/components/atoms"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  ariaLabel?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Nawigacja stron",
}: PaginationProps) {
  const [goToPage, setGoToPage] = useState("")

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near start
        pages.push(2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Middle
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }

    onPageChange(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage, 10)

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum)
      setGoToPage("")
    }
  }

  const handleGoToPageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGoToPage()
    }
  }

  return (
    <nav className="mt-10" aria-label={ariaLabel} role="navigation">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <PaginationButton
          isNavArrow
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Poprzednia strona"
          title="Poprzednia strona"
        >
          <span className="text-lg font-bold">&lsaquo;</span>
        </PaginationButton>

        <div className="flex items-center gap-1" role="list">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="mx-1 flex items-center text-[#3B3634]/60"
                  aria-hidden="true"
                >
                  ...
                </div>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <PaginationButton
                key={pageNumber}
                isActive={isActive}
                onClick={() => handlePageChange(pageNumber)}
                aria-label={`Strona ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
                title={`Przejdź do strony ${pageNumber}`}
                role="listitem"
              >
                {pageNumber}
              </PaginationButton>
            )
          })}
        </div>

        <PaginationButton
          isNavArrow
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Następna strona"
          title="Następna strona"
        >
          <span className="text-lg font-bold">&rsaquo;</span>
        </PaginationButton>

        <div className="hidden md:flex items-center ml-3">
          <span className="mr-2 text-sm font-instrument-sans text-[#3B3634]/70">
            Idź do strony:
          </span>
          <div className="flex relative ring-1 ring-[#3B3634] rounded-full overflow-hidden">
            <input
              type="text"
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={handleGoToPageKeyDown}
              className="w-12 h-10 px-3 bg-primary text-sm font-instrument-sans focus:outline-none border-none"
              aria-label="Przejdź do strony"
            />
            <button
              onClick={handleGoToPage}
              className="h-10 px-3 text-[#3B3634] hover:bg-[#BFB7AD] text-sm focus:outline-none border-none bg-transparent transition-colors"
              aria-label="Potwierdź numer strony"
              title="Przejdź do podanej strony"
            >
              <span className="text-lg font-bold">&rarr;</span>
            </button>
          </div>
        </div>

        <span className="sr-only" aria-live="polite" aria-atomic="true">
          Strona {currentPage} z {totalPages}
        </span>
      </div>
    </nav>
  )
}