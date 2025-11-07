import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import {
  getBlogPost,
  getBlogPosts,
  getSellerPost,
  getSellerPosts,
  getBlogCategories,
} from "../lib/data"
import { urlFor } from "../lib/sanity"
import BlogLayout from "../components/BlogLayout"
import PortableText from "../components/PortableText"
import { redirect } from "next/navigation"

// Must use force-dynamic because Header component uses cookies() for user authentication
export const dynamic = 'force-dynamic'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const [recentBlogPosts, recentSellerPosts] = await Promise.all([
      getBlogPosts().then((posts) => posts.slice(0, 20)).catch(() => []),
      getSellerPosts().then((posts) => posts.slice(0, 10)).catch(() => []),
    ])

    const blogParams = recentBlogPosts
      .filter((post) => post.slug?.current)
      .map((post) => ({ slug: post.slug.current }))

    const sellerParams = recentSellerPosts
      .filter((post) => post.slug?.current)
      .map((post) => ({ slug: post.slug.current }))

    return [...blogParams, ...sellerParams]
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params

    let post = await getBlogPost(slug)
    let isSellerPost = false

    if (!post) {
      post = await getSellerPost(slug)
      isSellerPost = true
    }

    if (!post) {
      return {
        title: "Post nie został znaleziony - Artovnia",
        description: "Szukany wpis nie istnieje lub został usunięty.",
      }
    }

    const title = post.seo?.metaTitle || post.title || "Artovnia Blog"
    let description: string = "Odkryj nasze wpisy blogowe i historie sprzedawców"

    if (post.seo?.metaDescription) {
      description = post.seo.metaDescription
    } else if ("excerpt" in post && post.excerpt && typeof post.excerpt === 'string') {
      description = post.excerpt
    } else if ("shortDescription" in post && post.shortDescription && typeof post.shortDescription === 'string') {
      description = post.shortDescription
    }

    let imageUrl: string | undefined
    try {
      imageUrl = post.mainImage
        ? urlFor(post.mainImage).width(1200).height(630).url()
        : undefined
    } catch (error) {
      console.error("Error processing image for metadata:", error)
    }

    let authorName: string | undefined
    if ("author" in post && post.author?.name && typeof post.author.name === 'string') {
      authorName = post.author.name
    } else if ("sellerName" in post && post.sellerName && typeof post.sellerName === 'string') {
      authorName = post.sellerName
    }

    const keywords = post.seo?.keywords?.join(", ") || undefined

    return {
      title: `${title} - Artovnia Blog`,
      description,
      keywords,
      authors: authorName ? [{ name: authorName }] : undefined,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.publishedAt,
        authors: authorName ? [authorName] : undefined,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
        locale: "pl_PL",
        siteName: "Artovnia",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Artovnia Blog",
      description: "Odkryj nasze wpisy blogowe i historie sprzedawców",
    }
  }
}

// Helper function to generate JSON-LD structured data
function generateStructuredData(post: any, imageUrl: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artovnia.com"

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.shortDescription || "",
    image: imageUrl ? `${baseUrl}${imageUrl}` : undefined,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author?.name || post.sellerName || "Artovnia",
    },
    publisher: {
      "@type": "Organization",
      name: "Artovnia",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug.current}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params

    let post = await getBlogPost(slug)
    let isSellerPost = false

    if (!post) {
      post = await getSellerPost(slug)
      isSellerPost = true
    }

    if (!post) {
      notFound()
    }

    // Redirect seller posts to dedicated route
    if (isSellerPost && 'sellerName' in post) {
      redirect(`/blog/seller/${slug}`)
    }

    // Regular blog post rendering
    const blogPost = post
    let imageUrl: string | null = null

    try {
      imageUrl = blogPost.mainImage
        ? urlFor(blogPost.mainImage).width(1200).height(600).url()
        : null
    } catch (error) {
      console.error("Error processing blog post image:", error)
    }

    const categories = await getBlogCategories()
    const structuredData = generateStructuredData(blogPost, imageUrl)

    return (
      <BlogLayout
        breadcrumbs={[
          { label: "Strona główna", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: blogPost.title, path: `/blog/${blogPost.slug.current}` },
        ]}
        categories={categories}
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <article
          className="max-w-4xl mx-auto bg-[#F4F0EB]"
          itemScope
          itemType="https://schema.org/BlogPosting"
        >
          {/* Header */}
          <header className="mb-8">
            {blogPost.categories && blogPost.categories.length > 0 && (
              <nav
                className="flex flex-wrap gap-2 mb-4"
                aria-label="Kategorie wpisu"
              >
                <ul className="flex flex-wrap gap-2 list-none" role="list">
                  {blogPost.categories.map((category) => (
                    <li key={category.slug.current} role="listitem">
                      <Link
                        href={`/blog/category/${category.slug.current}`}
                        className="text-sm md:text-base font-medium text-[#3B3634] hover:text-[#BFB7AD] bg-[#F4F0EB] border border-[#BFB7AD] px-3 py-1 rounded-full font-instrument-sans transition-colors"
                      >
                        {category.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-instrument-serif text-[#3B3634] mb-4 leading-tight"
              itemProp="headline"
            >
              {blogPost.title}
            </h1>

            {blogPost.excerpt && (
              <p
                className="text-lg md:text-xl text-[#3B3634] mb-6 leading-relaxed font-instrument-sans"
                itemProp="description"
              >
                {blogPost.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[#3B3634] border-b border-[#BFB7AD]/30 pb-6">
              {/* Author Info */}
              <div
                className="flex items-center space-x-4"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                {blogPost.author?.image && (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={urlFor(blogPost.author.image)
                        .width(48)
                        .height(48)
                        .url()}
                      alt={`Zdjęcie autora ${blogPost.author.name}`}
                      fill
                      className="rounded-full object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <p
                    className="font-medium text-[#3B3634] font-instrument-serif"
                    itemProp="name"
                  >
                    {blogPost.author?.name}
                  </p>
                  <time
                    dateTime={blogPost.publishedAt}
                    className="text-sm font-instrument-sans text-[#3B3634]/80"
                    itemProp="datePublished"
                  >
                    {format(new Date(blogPost.publishedAt), "dd MMMM yyyy", {
                      locale: pl,
                    })}
                  </time>
                </div>
              </div>

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <nav aria-label="Tagi wpisu">
                  <ul
                    className="flex flex-wrap gap-2 list-none"
                    role="list"
                    itemProp="keywords"
                  >
                    {blogPost.tags.map((tag) => (
                      <li key={tag} role="listitem">
                        <span className="text-xs text-[#3B3634] bg-[#BFB7AD]/20 px-2 py-1 rounded font-instrument-sans">
                          #{tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {imageUrl && (
            <figure className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] mb-8 overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={blogPost.mainImage?.alt || `Obraz wyróżniający: ${blogPost.title}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                itemProp="image"
              />
            </figure>
          )}

          {/* Content */}
          <div
            className="prose prose-base md:prose-lg max-w-none 
              prose-headings:font-instrument-serif prose-headings:text-[#3B3634]
              prose-p:font-instrument-sans prose-p:text-[#3B3634] prose-p:leading-relaxed
              prose-li:font-instrument-sans prose-li:text-[#3B3634]
              prose-a:text-[#3B3634] prose-a:underline hover:prose-a:text-[#BFB7AD]
              prose-strong:text-[#3B3634] prose-strong:font-semibold
              prose-blockquote:border-l-[#BFB7AD] prose-blockquote:text-[#3B3634]/80
              prose-code:text-[#3B3634] prose-code:bg-[#BFB7AD]/10
              prose-img:rounded-lg"
            itemProp="articleBody"
          >
            <PortableText content={blogPost.content} />
          </div>

          {/* Author Bio */}
          {blogPost.author?.bio && (
            <aside
              className="mt-12 p-6 bg-white border border-[#BFB7AD]/30 rounded-lg"
              aria-labelledby="author-bio-heading"
            >
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                {blogPost.author.image && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={urlFor(blogPost.author.image)
                        .width(64)
                        .height(64)
                        .url()}
                      alt={`Zdjęcie autora ${blogPost.author.name}`}
                      fill
                      className="rounded-full object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2
                    id="author-bio-heading"
                    className="text-lg md:text-xl font-instrument-serif text-[#3B3634] mb-2"
                  >
                    O autorze: {blogPost.author.name}
                  </h2>
                  <div className="text-[#3B3634] font-instrument-sans prose prose-sm max-w-none">
                    <PortableText content={blogPost.author.bio} />
                  </div>
                </div>
              </div>
            </aside>
          )}
        </article>
      </BlogLayout>
    )
  } catch (error) {
    console.error("Error rendering blog post page:", error)
    notFound()
  }
}