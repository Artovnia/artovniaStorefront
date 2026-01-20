import { Suspense } from 'react'
import { Metadata } from 'next'
import { generateBreadcrumbJsonLd } from '@/lib/helpers/seo'
import {
  getBlogPosts,
  getFeaturedPosts,
  getSellerPosts,
  getBlogCategories,
} from './lib/data'
import BlogLayout from './components/BlogLayout'
import BlogPostCard from './components/BlogPostCard'
import PaginatedBlogPosts from './components/PaginatedBlogPosts'
import PaginatedSellerPosts from './components/PaginatedSellerPosts'

// ✅ ISR - revalidate every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog - Artovnia | Inspiracje, Porady i Nowości ze Świata Sztuki',
  description:
    'Odkryj najnowsze wpisy blogowe, inspiracje artystyczne, porady dla twórców i poznaj naszych utalentowanych artystów. Blog Artovnia to źródło wiedzy o sztuce współczesnej.',
  keywords:
    'blog artystyczny, inspiracje artystyczne, porady dla artystów, sztuka współczesna, artyści, galeria',
  authors: [{ name: 'Artovnia' }],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
    languages: {
      pl: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
    },
  },
  openGraph: {
    title: 'Blog - Artovnia | Inspiracje, Porady i Nowości ze Świata Sztuki',
    description:
      'Odkryj najnowsze wpisy blogowe, inspiracje artystyczne, porady dla twórców i poznaj naszych utalentowanych artystów.',
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Artovnia',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@artovnia',
    creator: '@artovnia',
    title: 'Blog - Artovnia',
    description:
      'Odkryj najnowsze wpisy blogowe, inspiracje artystyczne i poznaj naszych artystów.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

function BlogPostsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
      role="status"
      aria-label="Ładowanie postów"
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#F4F0EB] rounded-lg shadow-md overflow-hidden animate-pulse flex flex-col"
          aria-hidden="true"
        >
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      ))}
      <span className="sr-only">Ładowanie postów...</span>
    </div>
  )
}

async function FeaturedPosts() {
  const featuredPosts = await getFeaturedPosts()

  if (!featuredPosts || featuredPosts.length === 0) {
    return null
  }

  return (
    <section
      className="mb-12 font-instrument-sans bg-[#F4F0EB]"
      aria-labelledby="featured-posts-heading"
    >
      <h2
        id="featured-posts-heading"
        className="text-2xl lg:text-3xl xl:text-4xl text-[#3B3634] mb-6 font-instrument-serif"
      >
        Wyróżnione posty
      </h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
        role="list"
      >
        {featuredPosts.map((post) => (
          <div key={post._id} role="listitem" className="flex w-full">
            <BlogPostCard post={post} featured />
          </div>
        ))}
      </div>
    </section>
  )
}

async function AllPosts() {
  const posts = await getBlogPosts()

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 font-instrument-sans bg-[#F4F0EB]" role="status">
        <h3 className="text-2xl lg:text-3xl xl:text-4xl text-[#3B3634] mb-2">
          Brak postów do wyświetlenia
        </h3>
        <p className="text-[#3B3634]">Sprawdź ponownie później</p>
      </div>
    )
  }

  return <PaginatedBlogPosts posts={posts} />
}

async function AllSellerPosts() {
  const posts = await getSellerPosts()

  if (!posts || posts.length === 0) {
    return null
  }

  return <PaginatedSellerPosts posts={posts} />
}

export default async function BlogPage() {
  const categories = await getBlogCategories()

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: 'Strona główna', path: '/' },
    { label: 'Blog', path: '/blog' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <BlogLayout
        title="Witaj w naszym Blogu"
        description="Odkryj najnowsze informacje, porady i wiedzę z naszego zespołu."
        breadcrumbs={[
          { label: 'Strona główna', path: '/' },
          { label: 'Blog', path: '/blog' },
        ]}
        categories={categories}
      >
        <Suspense fallback={<BlogPostsSkeleton />}>
          <FeaturedPosts />
        </Suspense>

        <Suspense fallback={<BlogPostsSkeleton />}>
          <AllPosts />
        </Suspense>

        <Suspense fallback={<BlogPostsSkeleton />}>
          <AllSellerPosts />
        </Suspense>
      </BlogLayout>
    </>
  )
}