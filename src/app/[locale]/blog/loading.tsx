export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#F4F0EB]">
      {/* Header Skeleton */}
      <div className="bg-[#F4F0EB] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="h-6 w-12 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 max-w-md mx-4">
              <div className="h-10 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Skeleton */}
      <div className="bg-[#F4F0EB] border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-96 bg-gray-300 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#F4F0EB] rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
