export default function SellerPostLoading() {
  return (
    <div className="min-h-screen bg-[#F4F0EB]">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="absolute top-10 left-10 w-32 h-32 border border-[#BFB7AD] opacity-60 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border border-[#BFB7AD] opacity-70 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 border-2 border-[#3B3634] opacity-5 rotate-45 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content Skeleton */}
            <header className="space-y-6 lg:space-y-8 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 w-40 bg-gray-300 rounded"></div>
                <div className="h-16 w-full bg-gray-300 rounded"></div>
                <div className="w-24 h-1 bg-gray-300"></div>
              </div>

              <div className="space-y-3">
                <div className="h-6 w-full bg-gray-300 rounded"></div>
                <div className="h-6 w-4/5 bg-gray-300 rounded"></div>
              </div>

              <div className="h-4 w-48 bg-gray-300 rounded"></div>

              <div className="h-12 w-48 bg-gray-300 rounded"></div>
            </header>

            {/* Right Images Skeleton */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
              {/* Main Image Skeleton */}
              <div className="absolute top-0 left-4 md:left-8 w-[280px] md:w-[350px] lg:w-[450px] h-3/4 md:h-4/5 transform -rotate-2 shadow-2xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-4 md:border-8 border-white bg-gray-300 animate-pulse"></div>
              </div>

              {/* Secondary Image Skeleton */}
              <div className="absolute bottom-0 right-0 w-[160px] md:w-[200px] lg:w-[250px] h-2/5 transform rotate-3 shadow-xl">
                <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-white bg-gray-300 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-full"></div>
            <div className="h-6 bg-gray-300 rounded w-11/12"></div>
            <div className="h-6 bg-gray-300 rounded w-full"></div>
            <div className="h-6 bg-gray-300 rounded w-10/12"></div>
            <div className="h-6 bg-gray-300 rounded w-full"></div>
            <div className="h-6 bg-gray-300 rounded w-9/12"></div>
          </div>

          {/* Featured Products Skeleton */}
          <aside className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[#BFB7AD]/30">
            <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-8 animate-pulse"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-primary rounded-lg shadow-lg overflow-hidden border-2 border-[#BFB7AD]">
                    <div className="relative h-48 md:h-64 bg-gray-300"></div>
                    <div className="p-4 md:p-6">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Call to Action Skeleton */}
          <div className="mt-12 md:mt-16 text-center animate-pulse">
            <div className="inline-block p-6 md:p-8">
              <div className="h-6 w-64 bg-gray-300 rounded mx-auto mb-6"></div>
              <div className="h-12 w-48 bg-gray-300 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
