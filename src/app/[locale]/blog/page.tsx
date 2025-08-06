import { Suspense } from 'react'
import { Metadata } from 'next'
import { getBlogPosts, getFeaturedPosts } from './lib/data'
import BlogLayout from './components/BlogLayout'
import BlogPostCard from './components/BlogPostCard'

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

async function FeaturedPosts() {
  const featuredPosts = await getFeaturedPosts()

  if (featuredPosts.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.map((post) => (
          <BlogPostCard key={post._id} post={post} featured />
        ))}
      </div>
    </section>
  )
}

async function AllPosts() {
  const posts = await getBlogPosts()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
        <p className="text-gray-600">Check back soon for new content!</p>
      </div>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}

export default function BlogPage() {
  return (
    <BlogLayout
      title="Welcome to our Blog"
      description="Discover the latest news, tips, and insights from our team."
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
