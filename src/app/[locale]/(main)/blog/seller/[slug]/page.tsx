import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { getSellerPost, getSellerPosts } from "../../lib/data"
import { urlFor } from "../../lib/sanity"
import { ArrowRightIcon } from "@/icons"
import PortableText from "../../components/PortableText"
import BlogLayoutWrapper from "../../components/BlogLayoutWrapper"

// ISR with 5-minute revalidation
export const revalidate = 300 // 5 minutes
export const dynamicParams = true // Generate pages on-demand for new slugs

interface SellerPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const sellerPosts = await getSellerPosts()
      .then((posts) => posts.slice(0, 20))
      .catch(() => [])

    return sellerPosts
      .filter((post) => post.slug?.current)
      .map((post) => ({ slug: post.slug.current }))
  } catch (error) {
    console.error("Error generating static params for seller posts:", error)
    return []
  }
}

export async function generateMetadata({
  params,
}: SellerPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getSellerPost(slug)

    if (!post) {
      return {
        title: "Projektant nie został znaleziony - Artovnia",
        description: "Szukany profil projektanta nie istnieje lub został usunięty.",
      }
    }

    const title = post.seo?.metaTitle || `${post.sellerName} - ${post.title}` || "Artovnia - Poznaj Projektanta"
    const description: string = post.seo?.metaDescription || post.shortDescription || "Odkryj historię i prace utalentowanego projektanta"

    let imageUrl: string | undefined
    try {
      imageUrl = post.mainImage
        ? urlFor(post.mainImage).width(1200).height(630).url()
        : undefined
    } catch (error) {
      console.error("Error processing image for metadata:", error)
    }

    const keywords = post.seo?.keywords?.join(", ") || undefined

    return {
      title: `${title} - Artovnia`,
      description,
      keywords,
      authors: [{ name: post.sellerName }],
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.publishedAt,
        authors: [post.sellerName],
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
        canonical: `/blog/seller/${slug}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata for seller post:", error)
    return {
      title: "Artovnia - Poznaj Projektanta",
      description: "Odkryj historię i prace utalentowanego projektanta",
    }
  }
}

// Helper function to generate JSON-LD structured data
function generateStructuredData(post: any, imageUrl: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artovnia.com"

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: post.sellerName,
      description: post.shortDescription,
      image: imageUrl ? `${baseUrl}${imageUrl}` : undefined,
      url: `${baseUrl}/sellers/${post.sellerHandle}`,
    },
    datePublished: post.publishedAt,
    dateModified: post._updatedAt || post.publishedAt,
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
      "@id": `${baseUrl}/blog/seller/${post.slug.current}`,
    },
  }
}

export default async function SellerPostPage({ params }: SellerPostPageProps) {
  const { slug } = await params
  console.log('🎨 SELLER POST PAGE: Rendering seller post:', slug)
  
  let post
  try {
    post = await getSellerPost(slug)
    console.log('✅ SELLER POST: Post fetched:', post ? 'FOUND' : 'NOT FOUND')
  } catch (error) {
    console.error('❌ SELLER POST: Error fetching post:', error)
    notFound()
  }

  if (!post) {
    notFound()
  }

  let mainImageUrl: string | null = null
  let secondaryImageUrl: string | null = null

  try {
    mainImageUrl = post.mainImage
      ? urlFor(post.mainImage).width(800).height(640).url()
      : null
    secondaryImageUrl = post.secondaryImage
      ? urlFor(post.secondaryImage).width(400).height(300).url()
      : null
  } catch (error) {
    console.error("Error processing seller post images:", error)
  }

  const structuredData = generateStructuredData(post, mainImageUrl)

  return (
      <BlogLayoutWrapper
        breadcrumbs={[
          { label: "Strona główna", path: "/" },
          { label: "Blog", path: "/blog" },
          { label: post.sellerName, path: `/blog/seller/${post.slug.current}` },
        ]}
      >
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article
        className="bg-[#F4F0EB]"
        itemScope
        itemType="https://schema.org/ProfilePage"
      >
          {/* Hero Section with Artistic Layout */}
          <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-12" aria-hidden="true">
              <div className="absolute top-10 left-10 w-32 h-32 border border-[#BFB7AD] opacity-60 rounded-full"></div>
              <div className="absolute top-32 right-20 w-24 h-24 border border-[#BFB7AD] opacity-70 rounded-full"></div>
              <div className="absolute bottom-20 left-32 w-40 h-40 border-2 border-[#3B3634] opacity-5 rotate-45"></div>
              <div className="absolute top-16 right-4 w-16 h-16 border-2 border-[#BFB7AD] rounded-full opacity-30"></div>
              <div className="absolute bottom-32 left-0 w-8 h-8 bg-[#BFB7AD] rounded-full opacity-10"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Content */}
                <header className="space-y-6 lg:space-y-8">
                  <div className="space-y-4">
                    <p className="text-[#3B3634] text-sm md:text-base lg:text-lg font-light tracking-wide uppercase">
                      Projektant tygodnia
                    </p>
                    <h1
                      className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-instrument-serif italic text-[#3B3634] leading-tight"
                      itemProp="name"
                    >
                      {post.sellerName}
                    </h1>
                    <div className="w-24 h-1 bg-[#BFB7AD]" aria-hidden="true"></div>
                  </div>

                  <p
                    className="text-lg md:text-xl text-[#3B3634] leading-relaxed font-light"
                    itemProp="description"
                  >
                    {post.shortDescription}
                  </p>

                  <time
                    dateTime={post.publishedAt}
                    className="block text-sm text-[#3B3634]/70 font-instrument-sans"
                    itemProp="datePublished"
                    suppressHydrationWarning
                  >
                    Opublikowano: {format(new Date(post.publishedAt), "dd MMMM yyyy", { locale: pl })}
                  </time>

                  {/* Visit Store Button */}
                  <Link
                    href={`/sellers/${post.sellerHandle}`}
                    className="inline-flex items-center space-x-3 ring-1 ring-[#BFB7AD] text-black px-6 md:px-8 py-3 md:py-4 hover:bg-[#3B3634] hover:text-white transition-all duration-300 group"
                    aria-label={`Odwiedź sklep ${post.sellerName}`}
                  >
                    <span className="font-medium font-instrument-sans">ODWIEDŹ SKLEP</span>
                    <ArrowRightIcon
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      size={20}
                      color="currentColor"
                      aria-hidden="true"
                    />
                  </Link>
                </header>

                {/* Right Images - Artistic Layout */}
                <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
                  {/* Main Image */}
                  {mainImageUrl && (
                    <figure className="absolute top-0 left-4 md:left-8 w-[280px] md:w-[350px] lg:w-[450px] h-3/4 md:h-4/5 transform -rotate-2 shadow-2xl">
                      <div className="relative w-full h-full rounded-lg overflow-hidden border-4 md:border-8 border-white">
                        <Image
                          src={mainImageUrl}
                          alt={post.mainImage?.alt || `Zdjęcie główne ${post.sellerName}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 450px"
                          priority
                          fetchPriority="high"
                          loading="eager"
                          itemProp="image"
                        />
                      </div>
                    </figure>
                  )}

                  {/* Secondary Image */}
                  {secondaryImageUrl && (
                    <figure className="absolute bottom-0 right-0 w-[160px] md:w-[200px] lg:w-[250px] h-2/5 transform rotate-3 shadow-xl">
                      <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-white">
                        <Image
                          src={secondaryImageUrl}
                          alt={post.secondaryImage?.alt || `Zdjęcie dodatkowe ${post.sellerName}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 250px"
                          priority
                          fetchPriority="high"
                          loading="eager"
                        />
                      </div>
                    </figure>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="py-12 md:py-16 lg:py-24">
            <div className="max-w-4xl mx-auto px-4 lg:px-8">
              {/* Article Content */}
              <div
                className="prose prose-base md:prose-lg max-w-none
                  prose-headings:font-instrument-serif prose-headings:text-[#3B3634]
                  prose-p:font-instrument-sans prose-p:text-[#3B3634] prose-p:leading-relaxed
                  prose-li:font-instrument-sans prose-li:text-[#3B3634]
                  prose-a:text-[#3B3634] prose-a:underline hover:prose-a:text-[#BFB7AD]
                  prose-strong:text-[#3B3634] prose-strong:font-semibold
                  prose-blockquote:border-l-[#BFB7AD] prose-blockquote:text-[#3B3634]/80
                  prose-img:rounded-lg"
                itemProp="articleBody"
              >
                {post.content ? (
                  <PortableText content={post.content} />
                ) : (
                  <p>Brak treści artykułu.</p>
                )}
              </div>

              {/* Featured Products Section */}
              {post.linkedProducts && post.linkedProducts.length > 0 && (
                <aside className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[#BFB7AD]/30" aria-labelledby="featured-products-heading">
                  <h2
                    id="featured-products-heading"
                    className="text-2xl md:text-3xl font-light text-[#3B3634] mb-8 text-center font-instrument-serif"
                  >
                    Wybrane <span className="italic">dzieła</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list">
                    {post.linkedProducts.map((product, index) => (
                      <article
                        key={product.productId}
                        role="listitem"
                        className={`group cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                          index % 2 === 0 ? "rotate-1" : "-rotate-1"
                        } hover:rotate-0`}
                      >
                        <Link
                          href={`/products/${product.productHandle}`}
                          className="block"
                          aria-label={`Zobacz produkt: ${product.productName}`}
                        >
                          <div className="bg-primary rounded-lg shadow-lg overflow-hidden border-2 border-[#BFB7AD]">
                            {product.productImage && (
                              <figure className="relative h-48 md:h-64">
                                <Image
                                  src={
                                    product.productImage && product.productImage.asset
                                      ? urlFor(product.productImage).width(400).height(320).url()
                                      : "/images/hero/Image.jpg"
                                  }
                                  alt={product.productImage?.alt || product.productName}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                              </figure>
                            )}
                            <div className="p-4 md:p-6 hover:bg-[#3B3634]  transition-colors duration-300">
                              <h3 className="text-base md:text-lg font-medium text-[#3B3634] hover:text-white font-instrument-serif">
                                {product.productName}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </aside>
              )}

              {/* Call to Action */}
              <div className="mt-12 md:mt-16 text-center">
                <div className="inline-block p-6 md:p-8">
                  <p className="text-base md:text-lg text-[#3B3634] mb-6 font-instrument-sans">
                    Odkryj więcej prac artysty w jego sklepie
                  </p>
                  <Link
                    href={`/sellers/${post.sellerHandle}`}
                    className="inline-flex items-center space-x-3 ring-1 ring-[#BFB7AD] text-black px-6 md:px-8 py-3 md:py-4 hover:bg-[#3B3634] hover:text-white transition-all duration-300 group"
                    aria-label={`Przejdź do sklepu ${post.sellerName}`}
                  >
                    <span className="font-instrument-sans">PRZEJDŹ DO SKLEPU</span>
                    <ArrowRightIcon
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                      size={20}
                      color="currentColor"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </article>
      </BlogLayoutWrapper>
    )
}
