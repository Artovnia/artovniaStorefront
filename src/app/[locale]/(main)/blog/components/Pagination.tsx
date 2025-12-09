"use client"

// Inline icon components
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
)

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
    onPageChange(page)
    // Scroll to top smoothly when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav
      className="flex items-center justify-center space-x-2 mt-8"
      aria-label={ariaLabel}
      role="navigation"
    >
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 bg-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Poprzednia strona"
        title="Poprzednia strona"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1" role="list">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-4 py-2 rounded-md font-medium transition-colors font-instrument-sans ${
                isActive
                  ? "bg-[#3B3634] text-white"
                  : "bg-primary text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
              aria-label={`Strona ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
              title={`Przejdź do strony ${pageNumber}`}
              role="listitem"
            >
              {pageNumber}
            </button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 bg-primary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Następna strona"
        title="Następna strona"
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Screen reader announcement for current page */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        Strona {currentPage} z {totalPages}
      </span>
    </nav>
  )
}