import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { getBlogPost, getBlogPosts, getSellerPost, getSellerPosts } from '../lib/data'
import { urlFor } from '../lib/sanity'
import BlogLayout from '../components/BlogLayout'
import PortableText from '../components/PortableText'
import { SellerPostLayout } from '../components/SellerPostLayout'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  try {
    const [blogPosts, sellerPosts] = await Promise.all([
      getBlogPosts().catch(error => {
        console.error('Error fetching blog posts for static params:', error);
        return [];
      }),
      getSellerPosts().catch(error => {
        console.error('Error fetching seller posts for static params:', error);
        return [];
      })
    ])
    
    const blogPostParams = blogPosts.map((post) => ({
      slug: post.slug?.current || '',
    })).filter(param => param.slug)
    
    const sellerPostParams = sellerPosts.map((post) => ({
      slug: post.slug?.current || '',
    })).filter(param => param.slug)
    
    return [...blogPostParams, ...sellerPostParams]
  } catch (error) {
    console.error('Fatal error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    
    // Try to fetch both blog post and seller post
    const [blogPost, sellerPost] = await Promise.all([
      getBlogPost(slug),
      getSellerPost(slug)
    ])
    
    const post = blogPost || sellerPost

    if (!post) {
      return {
        title: 'Post Not Found',
      }
    }

    // Handle metadata for both post types
    const title = post.seo?.metaTitle || post.title
    const description = post.seo?.metaDescription || 
      ('excerpt' in post ? post.excerpt : 'shortDescription' in post ? post.shortDescription : '') || ''
    
    let imageUrl;
    try {
      imageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined
    } catch (imageError) {
      console.error('Failed to process image URL:', imageError);
      imageUrl = undefined;
    }

    return {
      title: `${title} - Artovnia Blog`,
      description,
      keywords: post.seo?.keywords?.join(', '),
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.publishedAt,
        authors: 'author' in post && post.author?.name ? [post.author.name] : 
                'sellerName' in post ? [post.sellerName] : undefined,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Artovnia Blog',
      description: 'Explore our blog posts and seller stories',
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params
    
    // Try to fetch both blog post and seller post
    const [blogPost, sellerPost] = await Promise.all([
      getBlogPost(slug).catch(error => {
        console.error(`Error fetching blog post in page component: ${error.message}`);
        return null;
      }),
      getSellerPost(slug).catch(error => {
        console.error(`Error fetching seller post in page component: ${error.message}`);
        return null;
      })
    ])
    
    const post = blogPost || sellerPost

    if (!post) {
      console.error(`No post found for slug: ${slug}`);
      notFound()
    }

    // If it's a seller post, render with SellerPostLayout
    if (sellerPost) {
      return <SellerPostLayout post={sellerPost as any} />
    }

    // Otherwise, render as regular blog post (we know it's a BlogPost now)
    const blogPostData = post as import('../lib/data').BlogPost
    let imageUrl = null;
    try {
      imageUrl = blogPostData.mainImage 
        ? urlFor(blogPostData.mainImage).width(1200).height(600).url()
        : null;
    } catch (imageError) {
      console.error('Error processing blog post image:', imageError);
      // Continue without the image if there's an error
    }

  return (
    <BlogLayout>
      <article className="max-w-4xl mx-auto bg-[#F4F0EB]">
        {/* Header */}
        <header className="mb-8">
          {blogPostData.categories && blogPostData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blogPostData.categories.map((category: any) => (
                <Link
                  key={category.slug.current}
                  href={`/blog/category/${category.slug.current}`}
                  className="text-sm font-medium text-[#3B3634] hover:text-[#BFB7AD] bg-[#F4F0EB] border border-[#BFB7AD] px-3 py-1 rounded-full font-instrument-sans transition-colors"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-instrument-serif text-[#3B3634] mb-4 leading-tight">
            {blogPostData.title}
          </h1>
          
          {blogPostData.excerpt && (
            <p className="text-xl text-[#3B3634] mb-6 leading-relaxed font-instrument-sans">
              {blogPostData.excerpt}
            </p>
          )}
          
          <div className="flex items-center justify-between text-[#3B3634] border-b border-[#BFB7AD]/30 pb-6">
            <div className="flex items-center space-x-4">
              {blogPostData.author?.image && (
                <div className="relative w-12 h-12">
                  <Image
                    src={urlFor(blogPostData.author.image).width(48).height(48).url()}
                    alt={blogPostData.author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-[#3B3634] font-instrument-serif">{blogPostData.author?.name}</p>
                <time dateTime={blogPostData.publishedAt} className="text-sm font-instrument-sans text-[#3B3634]/80">
                  {format(new Date(blogPostData.publishedAt), 'MMMM dd, yyyy')}
                </time>
              </div>
            </div>
            
            {blogPostData.tags && blogPostData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogPostData.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs text-[#3B3634] bg-[#BFB7AD]/20 px-2 py-1 rounded font-instrument-sans"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={blogPostData.mainImage?.alt || blogPostData.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-instrument-serif prose-p:font-instrument-sans prose-li:font-instrument-sans prose-headings:text-[#3B3634] prose-p:text-[#3B3634] prose-a:text-[#BFB7AD] hover:prose-a:text-[#3B3634]">
          <PortableText content={blogPostData.content} />
        </div>

        {/* Author Bio */}
        {blogPostData.author?.bio && (
          <div className="mt-12 p-6 bg-[#F4F0EB] border border-[#BFB7AD]/30 rounded-lg">
            <div className="flex items-start space-x-4">
              {blogPostData.author.image && (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={urlFor(blogPostData.author.image).width(64).height(64).url()}
                    alt={blogPostData.author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-instrument-serif text-[#3B3634] mb-2">
                  O autorze: {blogPostData.author.name}
                </h3>
                <div className="text-[#3B3634] font-instrument-sans">
                  <PortableText content={blogPostData.author.bio} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-[#BFB7AD]/30">
          <Link
            href="/blog"
            className="inline-flex items-center text-[#BFB7AD] hover:text-[#3B3634] font-instrument-sans transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Powrót do bloga
          </Link>
        </div>
      </article>
    </BlogLayout>
  )
} catch (error) {
  console.error('Error rendering blog post page:', error);
  notFound();
}
}
