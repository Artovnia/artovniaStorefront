export default function SellersPageLoading() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden bg-gray-200 animate-pulse">
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-12 bg-gray-300 rounded w-64 mb-6" />
            <div className="h-6 bg-gray-300 rounded w-96" />
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <div className="max-w-[1920px] mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Filter Bar Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="flex gap-4 mb-4">
              <div className="h-10 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded w-32" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-8" />
              ))}
            </div>
          </div>

          {/* Results Info Skeleton */}
          <div className="px-4 sm:px-6 py-4 bg-primary max-w-[1200px] mx-auto mb-4">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>

          {/* Sellers Grid Skeleton */}
          <div className="px-4 sm:px-6 py-8 max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
              {Array.from({ length: 12 }).map((_, index) => (
                <div 
                  key={index} 
                  className="w-[270px] h-[380px] bg-primary shadow-md animate-pulse"
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
        </div>
      </div>
    </div>
  )
}
