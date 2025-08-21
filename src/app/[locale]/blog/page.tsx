import { Suspense } from 'react'
import { Metadata } from 'next'
import { getBlogPosts, getFeaturedPosts } from './lib/data'
import BlogLayout from './components/BlogLayout'
import BlogPostCard from './components/BlogPostCard'

// OPTIMIZED: Enable ISR for better performance
export const revalidate = 600 // 10 minutes

export const metadata: Metadata = {
  title: 'Blog - Artovnia',
  description: 'Discover the latest news, tips, and insights from Artovnia.',
  openGraph: {
    title: 'Blog - Artovnia',
    description: 'Discover the latest news, tips, and insights from Artovnia.',
    type: 'website',
  },
}

function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-[#F4F0EB] rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-[#F4F0EB]"></div>
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

async function FeaturedPosts() {
  try {
    const featuredPosts = await getFeaturedPosts()

    if (featuredPosts.length === 0) {
      return null
    }

    return (
      <section className="mb-12 font-instrument-sans bg-[#F4F0EB]">
        <h2 className="text-2xl font-semibold text-[#3B3634] mb-6 font-instrument-serif">Wyróżnione posty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <BlogPostCard key={post._id} post={post} featured />
          ))}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error rendering featured posts:', error)
    return null
  }
}

async function AllPosts() {
  try {
    const posts = await getBlogPosts()

    if (posts.length === 0) {
      return (
        <div className="text-center py-12 font-instrument-sans bg-[#F4F0EB]">
          <h3 className="text-xl font-medium text-[#3B3634] mb-2">Nie ma jeszcze żadnych postów</h3>
          <p className="text-[#3B3634]">Wróć za jakiś czas!</p>
        </div>
      )
    }

    return (
      <section className="font-instrument-sans bg-[#F4F0EB]">
        <h2 className="text-2xl font-semibold text-[#3B3634] mb-6 font-instrument-serif">Wszystkie posty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      </section>
    )
  } catch (error) {
    console.error('Error rendering all posts:', error)
    return (
      <div className="text-center py-12 font-instrument-sans bg-[#F4F0EB]">
        <h3 className="text-xl font-medium text-[#3B3634] mb-2">Wystąpił błąd podczas ładowania postów</h3>
        <p className="text-[#3B3634]">Spróbuj odświeżyć stronę</p>
      </div>
    )
  }
}

export default function BlogPage() {
  return (
    <BlogLayout
      title="Witaj w naszym Blogu"
      description="Odkryj najnowsze informacje, porady i wiedzę z naszego zespołu."
      breadcrumbs={[
        { label: 'Strona główna', path: '/' },
        { label: 'Blog', path: '/blog' }
      ]}
    >
      <Suspense fallback={<BlogPostsSkeleton />}>
        <FeaturedPosts />
      </Suspense>
      
      <Suspense fallback={<BlogPostsSkeleton />}>
        <AllPosts />
      </Suspense>
    </BlogLayout>
  )
}
