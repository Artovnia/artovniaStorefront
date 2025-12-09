import { Suspense } from "react"
import BlogLayout from "./BlogLayout"
import { getBlogCategories } from "../lib/data"
import { unstable_cache } from "next/cache"

/**
 * Cached wrapper for BlogLayout that fetches categories once
 * This ensures the blog hero, search, and navigation are cached
 * and render immediately on subsequent visits
 */

// Cache the categories fetch for 5 minutes
const getCachedBlogCategories = unstable_cache(
  async () => {
    console.log("🔄 BLOG LAYOUT: Fetching categories from Sanity")
    const categories = await getBlogCategories()
    console.log("✅ BLOG LAYOUT: Categories fetched:", categories.length)
    return categories
  },
  ['blog-categories'],
  {
    revalidate: 300, // 5 minutes
    tags: ['blog-categories']
  }
)

interface BlogLayoutWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: { label: string; path: string }[]
}

export default async function BlogLayoutWrapper({
  children,
  title,
  description,
  breadcrumbs,
}: BlogLayoutWrapperProps) {
  console.log("📦 BLOG LAYOUT WRAPPER: Rendering")
  
  // Fetch categories with caching
  const categories = await getCachedBlogCategories()

  return (
    <BlogLayout
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      categories={categories}
    >
      {/* Wrap children in Suspense to allow BlogLayout to render immediately */}
      <Suspense fallback={
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </BlogLayout>
  )
}
