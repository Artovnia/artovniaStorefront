import { Metadata } from 'next'
import { Suspense } from 'react'
import { searchBlogPosts } from '../lib/data'
import BlogLayout from '../components/BlogLayout'
import BlogPostCard from '../components/BlogPostCard'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  const query = q || ''
  
  return {
    title: query ? `Search results for &quot;${query}&quot; - Artovnia Blog` : 'Search - Artovnia Blog',
    description: query ? `Search results for &quot;${query}&quot;` : 'Wyszukaj post',
    robots: 'noindex', // Don't index search pages
  }
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
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
  )
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-[#3B3634] mb-2 font-instrument-serif">Wprowadź wyszukiwaną frazę</h3>
        <p className="text-[#3B3634] font-instrument-sans">Użyj pola wyszukiwania powyżej, aby znaleźć posty na blogu</p>
      </div>
    )
  }

  const posts = await searchBlogPosts(query)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-[#3B3634] mb-2 font-instrument-serif">Nie znaleziono wyników</h3>
        <p className="text-[#3B3634] font-instrument-sans">
          Nie znaleziono postów dla zapytania &quot;{query}&quot;. Spróbuj innych słów kluczowych lub przeglądaj nasze kategorie.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-[#3B3634] font-instrument-sans">
          Znaleziono {posts.length} {posts.length === 1 ? 'wynik' : posts.length < 5 ? 'wyniki' : 'wyników'} dla &quot;{query}&quot;
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post._id} post={post} />
        ))}
      </div>
    </>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ''

  return (
    <BlogLayout
      title="Search Results"
      description={query ? `Search results for &quot;${query}&quot;` : 'Search blog posts'}
    >
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </BlogLayout>
  )
}
