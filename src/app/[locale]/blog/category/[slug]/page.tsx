import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getBlogCategories, getPostsByCategory } from '../../lib/data'
import BlogLayout from '../../components/BlogLayout'
import BlogPostCard from '../../components/BlogPostCard'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const categories = await getBlogCategories()
  return categories.map((category) => ({
    slug: category.slug.current,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getBlogCategories()
  const category = categories.find(cat => cat.slug.current === params.slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.title} - Artovnia Blog`,
    description: category.description || `Browse all posts in ${category.title} category`,
    openGraph: {
      title: `${category.title} - Artovnia Blog`,
      description: category.description || `Browse all posts in ${category.title} category`,
      type: 'website',
    },
  }
}

function PostsSkeleton() {
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

async function CategoryPosts({ categorySlug }: { categorySlug: string }) {
  const posts = await getPostsByCategory(categorySlug)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No posts in this category yet</h3>
        <p className="text-gray-600">Check back soon for new content!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogPostCard key={post._id} post={post} />
      ))}
    </div>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await getBlogCategories()
  const category = categories.find(cat => cat.slug.current === params.slug)

  if (!category) {
    notFound()
  }

  return (
    <BlogLayout
      title={category.title}
      description={category.description || `Browse all posts in ${category.title} category`}
    >
      <Suspense fallback={<PostsSkeleton />}>
        <CategoryPosts categorySlug={params.slug} />
      </Suspense>
    </BlogLayout>
  )
}
