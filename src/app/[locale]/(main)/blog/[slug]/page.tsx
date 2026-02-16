import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { getBlogPost, getBlogPostSlugs, getBlogCategories, getAdjacentPosts, getRelatedPosts } from '../lib/data'
import { urlFor } from '../lib/sanity'
import BlogLayout from '../components/BlogLayout'
import PortableText from '../components/PortableText'
import PostNavigation from '../components/PostNavigation'
import RelatedPosts from '../components/RelatedPosts'
import ShopCategoriesLink from '../components/ShopCategoriesLink'
import { generateBreadcrumbJsonLd } from '@/lib/helpers/seo'

// ✅ ISR - revalidate every 30 minutes
export const revalidate = 1800

// ✅ Allow dynamic params for new posts
export const dynamicParams = true

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  // ✅ Wrap in try-catch for Vercel build stability
  try {
    const slugs = await getBlogPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating blog post static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params

  if (slug === 'seller') {
    return { title: 'Artovnia Blog' }
  }

  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: 'Post nie został znaleziony - Artovnia',
      description: 'Szukany wpis nie istnieje lub został usunięty.',
    }
  }

  const title = post.seo?.metaTitle || post.title || 'Artovnia Blog'
  const description: string = post.seo?.metaDescription || post.excerpt || 'Odkryj nasze wpisy blogowe'

  let imageUrl: string | undefined
  try {
    imageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined
  } catch {
    // Ignore image processing errors
  }

  // Build comprehensive keywords from post categories and tags
  const postKeywords = [
    ...(post.seo?.keywords || []),
    ...(post.tags || []),
    'rękodzieło',
    'handmade',
    'blog artystyczny',
  ].filter(Boolean).join(', ')

  return {
    title: `${title} | Blog Artovnia`,
    description,
    keywords: postKeywords || undefined,
    authors: post.author?.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: (post as any)._updatedAt || post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
      locale: 'pl_PL',
      siteName: 'Artovnia',
      section: post.categories?.[0]?.title || 'Blog',
      tags: post.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
      site: '@artovnia',
      creator: '@artovnia',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

function generateStructuredData(post: any, imageUrl: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://artovnia.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: imageUrl || undefined,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Artovnia',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Artovnia',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug.current}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  if (slug === 'seller') {
    notFound()
  }

  // Fetch blog post and categories first
  const [blogPost, categories] = await Promise.all([getBlogPost(slug), getBlogCategories()])

  if (!blogPost) {
    notFound()
  }

  // Fetch navigation and related posts in parallel (after we have the post)
  const [adjacentPosts, relatedPosts] = await Promise.all([
    getAdjacentPosts(slug),
    getRelatedPosts(
      blogPost._id,
      blogPost.categories?.map(c => c.slug.current) || [],
      blogPost.tags || [],
      4
    ),
  ])

  let imageUrl: string | null = null
  try {
    imageUrl = blogPost.mainImage ? urlFor(blogPost.mainImage).width(1200).height(600).url() : null
  } catch {
    // Ignore image processing errors
  }

  const structuredData = generateStructuredData(blogPost, imageUrl)
  
  // Generate breadcrumb JSON-LD
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: 'Strona główna', path: '/' },
    { label: 'Blog', path: '/blog' },
    { label: blogPost.title, path: `/blog/${blogPost.slug.current}` },
  ])

  return (
    <BlogLayout
      title={blogPost.title}
      description={blogPost.excerpt}
      breadcrumbs={[
        { label: 'Strona główna', path: '/' },
        { label: 'Blog', path: '/blog' },
        { label: blogPost.title, path: `/blog/${blogPost.slug.current}` },
      ]}
      categories={categories}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="max-w-4xl mx-auto bg-[#F4F0EB]" itemScope itemType="https://schema.org/BlogPosting">
        <header className="mb-8">
          {blogPost.categories && blogPost.categories.length > 0 && (
            <nav className="flex flex-wrap gap-2 mb-4" aria-label="Kategorie wpisu">
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

          <div className="flex flex-col  sm:justify-between gap-4 text-[#3B3634] border-b border-[#BFB7AD]/30 pb-6">
            <div
              className="flex items-left space-x-4"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              {blogPost.author?.image && (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={urlFor(blogPost.author.image).width(48).height(48).url()}
                    alt={`Zdjęcie autora ${blogPost.author.name}`}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-[#3B3634] font-instrument-serif" itemProp="name">
                  {blogPost.author?.name}
                </p>
                <time
                  dateTime={blogPost.publishedAt}
                  className="text-sm font-instrument-sans text-[#3B3634]/80"
                  itemProp="datePublished"
                  suppressHydrationWarning
                >
                  {format(new Date(blogPost.publishedAt), 'dd MMMM yyyy', { locale: pl })}
                </time>
              </div>
            </div>

            {blogPost.tags && blogPost.tags.length > 0 && (
              <nav aria-label="Tagi wpisu">
                <ul className="flex flex-wrap gap-2 list-none" role="list" itemProp="keywords">
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

        {imageUrl && (
          <figure className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] mb-8 overflow-hidden">
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

        {blogPost.author?.bio && (
          <aside
            className="mt-12 p-6 bg-white border border-[#BFB7AD]/30 rounded-lg"
            aria-labelledby="author-bio-heading"
          >
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              {blogPost.author.image && (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={urlFor(blogPost.author.image).width(64).height(64).url()}
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

        {/* Post Navigation - Previous/Next */}
        <PostNavigation 
          previousPost={adjacentPosts.previousPost} 
          nextPost={adjacentPosts.nextPost} 
        />

        {/* Related Posts for better internal linking */}
        <RelatedPosts 
          posts={relatedPosts} 
          currentPostId={blogPost._id} 
        />

        {/* Shop Categories Link - SEO internal linking to products */}
        <ShopCategoriesLink />
      </article>
    </BlogLayout>
  )
}