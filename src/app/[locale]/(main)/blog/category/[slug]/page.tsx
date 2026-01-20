import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getBlogCategories, getPostsByCategory, getCategorySlugs } from '../../lib/data'
import BlogLayout from '../../components/BlogLayout'
import BlogPostCard from '../../components/BlogPostCard'

// ✅ ISR - revalidate every 10 minutes
export const revalidate = 600
export const dynamicParams = true

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  // ✅ Use lightweight slugs query for static generation
  try {
    const slugs = await getCategorySlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating category static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getBlogCategories()
  const category = categories.find(cat => cat.slug.current === slug)

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
  const { slug } = await params
  const categories = await getBlogCategories()
  const category = categories.find(cat => cat.slug.current === slug)

  if (!category) {
    notFound()
  }

  return (
    <BlogLayout
      categories={categories}
      title={category.title}
      description={category.description || `Browse all posts in ${category.title} category`}
    >
      <Suspense fallback={<PostsSkeleton />}>
        <CategoryPosts categorySlug={slug} />
      </Suspense>
    </BlogLayout>
  )
}
