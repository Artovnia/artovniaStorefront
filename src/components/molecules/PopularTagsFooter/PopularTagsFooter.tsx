import Link from 'next/link'
import { getPopularTags } from '@/lib/data/tags'

/**
 * ✅ CONVERTED TO SERVER COMPONENT
 * 
 * Previously: Client component fetching from /api/popular-tags
 * Problem: API route caused build failures when backend was offline
 * 
 * Now: Server component calling getPopularTags() directly
 * Benefits:
 * - No build-time API route execution
 * - Cached server-side (1 hour)
 * - Fails gracefully if backend offline
 */
export async function PopularTagsFooter() {
  // Fetch tags server-side with error handling
  let tags: Array<{ value: string; slug: string; count: number }> = []
  
  try {
    const allTags = await getPopularTags(20)
    tags = allTags.slice(0, 8) // Top 8 tags for footer
  } catch (error) {
    console.error('Error loading popular tags:', error)
    // Return null if tags can't be loaded (graceful degradation)
    return null
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-white font-instrument-sans font-normal text-lg mb-6 uppercase">
        Popularne tagi
      </h2>
      <nav className="space-y-3 font-instrument-sans uppercase">
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="block text-white hover:text-primary transition-colors duration-200 text-sm"
          >
            {tag.value}
          </Link>
        ))}
        <Link
          href="/tags"
          className="block text-white hover:text-primary transition-colors duration-200 text-sm opacity-75"
        >
          Wszystkie tagi →
        </Link>
      </nav>
    </div>
  )
}
