export default function BlogLoading() {
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

        {/* Main Content Skeleton */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Featured Posts Section */}
          <div className="mb-12">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#F4F0EB] shadow-md overflow-hidden animate-pulse flex flex-col"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 flex-1 flex flex-col space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="flex gap-2 mt-auto pt-4">
                      <div className="h-6 w-12 bg-gray-300 rounded"></div>
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Posts Section */}
          <div className="mb-12">
            <div className="h-8 w-56 bg-gray-300 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#F4F0EB] shadow-md overflow-hidden animate-pulse flex flex-col"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 flex-1 flex flex-col space-y-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="flex gap-2 mt-auto pt-4">
                      <div className="h-6 w-12 bg-gray-300 rounded"></div>
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seller Posts Section */}
          <div className="mb-12">
            <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#F4F0EB] shadow-md overflow-hidden animate-pulse flex flex-col"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6 flex-1 flex flex-col space-y-3">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-10 w-40 bg-gray-300 rounded mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
