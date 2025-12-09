import { Suspense } from "react"
import BlogLayout from "./BlogLayout"
import { getBlogCategories } from "../lib/data"

/**
 * Wrapper for BlogLayout that fetches categories
 * Note: unstable_cache removed as it causes 500 errors with Sanity in production
 * ISR caching at page level (revalidate: 300) is sufficient
 */

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
  
  // Fetch categories with error handling
  // Note: Page-level ISR (revalidate: 300) handles caching
  let categories: any[] = []
  try {
    console.log("🔄 BLOG LAYOUT: Fetching categories from Sanity")
    categories = await getBlogCategories()
    console.log("✅ BLOG LAYOUT: Categories fetched:", categories.length)
  } catch (error) {
    console.error("❌ BLOG LAYOUT: Error fetching categories:", error)
    // Continue with empty categories rather than crashing
    categories = []
  }

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
