export default function SellerPostLoading() {
  return (
    <div className="min-h-screen bg-[#F4F0EB]" lang="pl">
      {/* Main Site Header Skeleton */}
      <div className="bg-white shadow-sm animate-pulse">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="flex items-center space-x-6">
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden bg-gray-300 animate-pulse">
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="h-12 md:h-16 w-64 md:w-96 bg-gray-400 rounded"></div>
            <div className="h-6 w-80 bg-gray-400 rounded"></div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumbs Skeleton */}
        <nav className="bg-[#F4F0EB] px-4 lg:px-8 py-4">
          <div className="flex items-center space-x-2 animate-pulse">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
          </div>
        </nav>

        {/* Search Bar Skeleton */}
        <div className="bg-[#F4F0EB]">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end">
              <div className="w-full max-w-md">
                <div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Skeleton */}
        <nav className="bg-[#F4F0EB] border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto py-4 border-b border-[#3B3634]/50 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 w-24 bg-gray-300 rounded flex-shrink-0"></div>
              ))}
            </div>
          </div>
        </nav>

        {/* Article Content */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section Skeleton */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-12">
            <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-pulse">
            {/* Left Content Skeleton */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <div className="h-5 w-40 bg-gray-300 rounded"></div>
                <div className="h-12 lg:h-16 w-3/4 bg-gray-300 rounded"></div>
                <div className="w-24 h-1 bg-gray-300"></div>
              </div>

              <div className="space-y-3">
                <div className="h-6 w-full bg-gray-300 rounded"></div>
                <div className="h-6 w-5/6 bg-gray-300 rounded"></div>
                <div className="h-6 w-4/5 bg-gray-300 rounded"></div>
              </div>

              <div className="h-4 w-48 bg-gray-300 rounded"></div>

              <div className="h-12 w-48 bg-gray-300 rounded"></div>
            </div>

            {/* Right Images Skeleton */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
              {/* Main Image Skeleton */}
              <div className="absolute top-0 left-4 md:left-8 w-[280px] md:w-[350px] lg:w-[450px] h-3/4 md:h-4/5 transform -rotate-2 shadow-2xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-4 md:border-8 border-white bg-gray-300"></div>
              </div>

              {/* Secondary Image Skeleton */}
              <div className="absolute bottom-0 right-0 w-[160px] md:w-[200px] lg:w-[250px] h-2/5 transform rotate-3 shadow-xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-white bg-gray-300"></div>
              </div>
            </div>
              </div>
            </div>
          </section>

          {/* Content Section Skeleton */}
          <section className="py-12 md:py-16 lg:py-24">
            <div className="max-w-4xl mx-auto animate-pulse">
              {/* Article Content Skeleton */}
              <div className="space-y-4 mb-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-11/12"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-4/5"></div>
              </div>
            ))}
              </div>

              {/* Featured Products Section Skeleton */}
              <div className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[#BFB7AD]/30">
                <div className="h-8 w-64 bg-gray-300 rounded mx-auto mb-8"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-primary rounded-lg shadow-lg overflow-hidden border-2 border-[#BFB7AD]"
                    >
                      <div className="h-48 md:h-64 bg-gray-300"></div>
                      <div className="p-4 md:p-6">
                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action Skeleton */}
              <div className="mt-12 md:mt-16 text-center">
                <div className="inline-block p-6 md:p-8">
                  <div className="h-6 w-80 bg-gray-300 rounded mx-auto mb-6"></div>
                  <div className="h-12 w-48 bg-gray-300 rounded mx-auto"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Newsletter Section Skeleton */}
      <div className="bg-[#3B3634] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center animate-pulse">
          <div className="h-10 w-64 bg-gray-500 rounded mx-auto mb-4"></div>
          <div className="h-6 w-96 bg-gray-500 rounded mx-auto mb-8"></div>
          <div className="flex justify-center gap-4">
            <div className="h-12 w-64 bg-gray-500 rounded"></div>
            <div className="h-12 w-32 bg-gray-500 rounded"></div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-[#F4F0EB] border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                <div className="h-4 w-28 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
