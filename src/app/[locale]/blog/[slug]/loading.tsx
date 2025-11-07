export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-[#F4F0EB]">
      {/* Breadcrumbs Skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
          <div className="h-4 w-4 bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Article Skeleton */}
      <article className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        {/* Categories */}
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-24 bg-gray-300 rounded-full"></div>
          <div className="h-8 w-28 bg-gray-300 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="space-y-3 mb-6">
          <div className="h-12 bg-gray-300 rounded w-3/4"></div>
          <div className="h-12 bg-gray-300 rounded w-full"></div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2 mb-6">
          <div className="h-6 bg-gray-300 rounded w-full"></div>
          <div className="h-6 bg-gray-300 rounded w-5/6"></div>
        </div>

        {/* Author Info */}
        <div className="flex items-center space-x-4 pb-6 border-b border-gray-300">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-3 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="w-full h-96 md:h-[500px] bg-gray-300 rounded-lg my-8"></div>

        {/* Content */}
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-11/12"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}