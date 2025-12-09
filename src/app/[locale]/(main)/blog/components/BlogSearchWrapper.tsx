'use client'

import { Suspense } from 'react'
import BlogSearch from './BlogSearch'

/**
 * Client-side wrapper for BlogSearch that ensures useSearchParams() is properly wrapped in Suspense
 * This fixes the "useSearchParams() should be wrapped in a suspense boundary" error
 */
export default function BlogSearchWrapper() {
  return (
    <Suspense fallback={
      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
    }>
      <BlogSearch />
    </Suspense>
  )
}
