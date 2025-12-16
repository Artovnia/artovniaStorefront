export default function PromotionsPageLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-12 bg-gray-300 rounded w-64 mb-6" />
            <div className="h-6 bg-gray-300 rounded w-96" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <div className="max-w-[1920px] mx-auto w-full">
        {/* Filter Bar Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 mb-6">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded w-40" />
              <div className="h-10 bg-gray-200 rounded w-40" />
              <div className="h-10 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>

        {/* Results Info Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 mx-auto py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
