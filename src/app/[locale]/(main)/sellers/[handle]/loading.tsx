export default function SellerPageLoading() {
  return (
    <main className="container">
      <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8">
        {/* Sidebar Skeleton */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="border rounded-sm p-6 bg-white animate-pulse">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gray-200" />
            </div>
            
            {/* Name */}
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 mx-auto" />
            
            {/* Rating */}
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
              ))}
            </div>
            
            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
            
            {/* Button */}
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        </aside>
        
        {/* Main Content Skeleton */}
        <div className="w-full">
          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
            </div>
          </div>
          
          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
