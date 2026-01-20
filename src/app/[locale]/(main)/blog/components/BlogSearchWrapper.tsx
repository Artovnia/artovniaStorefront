'use client'

import BlogSearch from './BlogSearch'

/**
 * Client-side wrapper for BlogSearch
 * Note: BlogSearch no longer uses useSearchParams() to avoid SSG bailout on Vercel
 * It reads URL params via window.location in useEffect instead
 */
export default function BlogSearchWrapper() {
  return <BlogSearch />
}
