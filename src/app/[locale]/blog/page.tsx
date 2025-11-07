import { Suspense } from "react"
import { Metadata } from "next"
import {
  getBlogPosts,
  getFeaturedPosts,
  getSellerPosts,
  getBlogCategories,
} from "./lib/data"
import BlogLayout from "./components/BlogLayout"
import BlogPostCard from "./components/BlogPostCard"
import PaginatedBlogPosts from "./components/PaginatedBlogPosts"
import PaginatedSellerPosts from "./components/PaginatedSellerPosts"

// Enable ISR for better performance
export const revalidate = 600 // 10 minutes

export const metadata: Metadata = {
  title: "Blog - Artovnia | Inspiracje, Porady i Nowości ze Świata Sztuki",
  description:
    "Odkryj najnowsze wpisy blogowe, inspiracje artystyczne, porady dla twórców i poznaj naszych utalentowanych artystów. Blog Artovnia to źródło wiedzy o sztuce współczesnej.",
  keywords:
    "blog artystyczny, inspiracje artystyczne, porady dla artystów, sztuka współczesna, artyści, galeria",
  authors: [{ name: "Artovnia" }],
  openGraph: {
    title: "Blog - Artovnia | Inspiracje, Porady i Nowości ze Świata Sztuki",
    description:
      "Odkryj najnowsze wpisy blogowe, inspiracje artystyczne, porady dla twórców i poznaj naszych utalentowanych artystów.",
    type: "website",
    locale: "pl_PL",
    siteName: "Artovnia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Artovnia",
    description:
      "Odkryj najnowsze wpisy blogowe, inspiracje artystyczne i poznaj naszych artystów.",
  },
  alternates: {
    canonical: "/blog",
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
  try {
    const featuredPosts = await getFeaturedPosts()

    if (featuredPosts.length === 0) {
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
  } catch (error) {
    console.error("Error rendering featured posts:", error)
    return null
  }
}

async function AllPosts() {
  try {
    const posts = await getBlogPosts()
    return <PaginatedBlogPosts posts={posts} />
  } catch (error) {
    console.error("Error rendering all posts:", error)
    return (
      <div
        className="text-center py-12 font-instrument-sans bg-[#F4F0EB]"
        role="alert"
        aria-live="assertive"
      >
        <h3 className="text-2xl lg:text-3xl xl:text-4xl text-[#3B3634] mb-2">
          Wystąpił błąd podczas ładowania postów
        </h3>
        <p className="text-[#3B3634]">Spróbuj odświeżyć stronę</p>
      </div>
    )
  }
}

async function AllSellerPosts() {
  try {
    const posts = await getSellerPosts()
    return <PaginatedSellerPosts posts={posts} />
  } catch (error) {
    console.error("Error rendering seller posts:", error)
    return null
  }
}

export default async function BlogPage() {
  const categories = await getBlogCategories()

  return (
    <BlogLayout
      title="Witaj w naszym Blogu"
      description="Odkryj najnowsze informacje, porady i wiedzę z naszego zespołu."
      breadcrumbs={[
        { label: "Strona główna", path: "/" },
        { label: "Blog", path: "/blog" },
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
  )
}