import { cache } from 'react'
import {
  client,
  isSanityConfigured,
  BLOG_POSTS_QUERY,
  BLOG_POST_QUERY,
  BLOG_CATEGORIES_QUERY,
  FEATURED_POSTS_QUERY,
  FEATURED_SELLER_POST_QUERY,
  SELLER_POST_QUERY,
  SELLER_POSTS_QUERY,
  NEWSLETTERS_QUERY,
  NEWSLETTER_QUERY,
  READY_NEWSLETTERS_QUERY,
  BLOG_POST_SLUGS_QUERY,
  SELLER_POST_SLUGS_QUERY,
  CATEGORY_SLUGS_QUERY,
} from './sanity'

// ============== INTERFACES ==============

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  excerpt?: string
  content?: any
  publishedAt: string
  authorName?: string
  authorBio?: any
  authorImage?: any
  mainImage?: any
  categoryTitles?: string[]
  categorySlugs?: string[]
  tags?: string[]
  featured?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
  author?: {
    name: string
    bio?: any
    image?: any
  }
  categories?: Array<{
    title: string
    slug: {
      current: string
    }
  }>
}

export interface BlogCategory {
  _id: string
  title: string
  slug: {
    current: string
  }
  description?: string
  color?: string
}

export interface Author {
  _id: string
  name: string
  slug: {
    current: string
  }
  image?: any
  bio?: any
  email?: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

export interface SellerPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  sellerName: string
  shortDescription: string
  sellerUrl: string
  mainImage?: any
  secondaryImage?: any
  content?: any
  linkedProducts?: Array<{
    productUrl: string
    productName: string
    productImage?: any
  }>
  publishedAt: string
  featuredOnHomepage?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

export interface Newsletter {
  _id: string
  title: string
  subject: string
  previewText?: string
  templateType: string
  content: any[]
  scheduledSendDate?: string
  targetAudience: string
  status: 'draft' | 'ready' | 'scheduled' | 'sent'
  publishedAt?: string
  _createdAt: string
  _updatedAt: string
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout<T>(
  query: string,
  params: Record<string, any> = {},
  timeoutMs: number = 15000
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const result = await client.fetch<T>(query, params, {
      // @ts-ignore - signal is supported but not in types
      signal: controller.signal,
    })
    return result
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    initialDelay?: number
    maxDelay?: number
    context?: string
  } = {}
): Promise<T> {
  const { retries = 3, initialDelay = 1000, maxDelay = 8000, context = 'Sanity' } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on abort (timeout)
      if (lastError.name === 'AbortError') {
        console.error(`[${context}] Request timed out`)
        throw lastError
      }

      if (attempt < retries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)
        console.warn(`[${context}] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

/**
 * Safe Sanity fetch with timeout, retry, and graceful fallback
 * ✅ Optimized for Vercel serverless functions
 */
async function safeFetch<T>(
  query: string,
  params: Record<string, any> = {},
  options: {
    timeout?: number
    retries?: number
    context?: string
    fallback?: T
    revalidate?: number | false
  } = {}
): Promise<T | null> {
  const { timeout = 15000, retries = 2, context = 'Sanity', fallback = null, revalidate = 60 } = options

  // Return fallback if Sanity is not configured (during build)
  if (!isSanityConfigured()) {
    console.warn(`[${context}] Sanity not configured, returning fallback`)
    return fallback
  }

  try {
    // ✅ Use Sanity client with Next.js cache options for Vercel compatibility
    const result = await withRetry(
      async () => {
        const data = await client.fetch<T>(query, params, {
          // ✅ Next.js fetch cache options - works better on Vercel than unstable_cache
          next: {
            revalidate: revalidate === false ? undefined : revalidate,
            tags: ['sanity', context.toLowerCase().replace(/[^a-z0-9]/g, '-')],
          },
        })
        return data
      },
      { retries, context }
    )
    return result
  } catch (error) {
    console.error(`[${context}] Fetch failed after retries:`, error)
    return fallback
  }
}

/**
 * Transform optimized data to legacy format for backward compatibility
 */
function transformBlogPost(post: any): BlogPost {
  if (!post) return post
  return {
    ...post,
    author: post.authorName
      ? {
          name: post.authorName,
          bio: post.authorBio,
          image: post.authorImage,
        }
      : undefined,
    categories: post.categoryTitles
      ? post.categoryTitles.map((title: string, index: number) => ({
          title,
          slug: { current: post.categorySlugs?.[index] || '' },
        }))
      : undefined,
  }
}

// ============== CACHED DATA FUNCTIONS ==============
// ✅ Using React cache + safeFetch with Next.js fetch caching for Vercel compatibility
// This approach is more reliable than unstable_cache on Vercel serverless

/**
 * Get all blog posts with caching
 */
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const posts = await safeFetch<any[]>(BLOG_POSTS_QUERY, {}, {
    context: 'getBlogPosts',
    fallback: [],
    revalidate: 60,
  })
  return (posts || []).map(transformBlogPost)
})

/**
 * Get featured posts with caching
 */
export const getFeaturedPosts = cache(async (): Promise<BlogPost[]> => {
  const posts = await safeFetch<any[]>(FEATURED_POSTS_QUERY, {}, {
    context: 'getFeaturedPosts',
    fallback: [],
    revalidate: 60,
  })
  return (posts || []).map(transformBlogPost)
})

/**
 * Get latest 3 blog posts with caching
 */
export const getLatestBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const query = `
    *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...3] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorImage": author->image,
      mainImage,
      "categoryTitles": categories[]->title,
      "categorySlugs": categories[]->slug.current,
      tags
    }
  `
  const posts = await safeFetch<any[]>(query, {}, {
    context: 'getLatestBlogPosts',
    fallback: [],
    revalidate: 60,
  })
  return (posts || []).map(transformBlogPost)
})

/**
 * Get single blog post by slug
 * ✅ Uses React cache for request deduplication + Next.js fetch cache for ISR
 */
export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const post = await safeFetch<any>(
    BLOG_POST_QUERY,
    { slug },
    { 
      context: `getBlogPost-${slug}`,
      revalidate: 1800, // 30 minutes
    }
  )
  return post ? transformBlogPost(post) : null
})

/**
 * Get blog categories with caching
 */
export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  const categories = await safeFetch<BlogCategory[]>(BLOG_CATEGORIES_QUERY, {}, {
    context: 'getBlogCategories',
    fallback: [],
    revalidate: 3600, // 1 hour
  })
  return categories || []
})

/**
 * Get posts by category with caching
 */
export const getPostsByCategory = cache(async (categorySlug: string): Promise<BlogPost[]> => {
  const query = `
    *[_type == "blogPost" && references(*[_type == "blogCategory" && slug.current == $categorySlug]._id) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorImage": author->image,
      mainImage,
      "categoryTitles": categories[]->title,
      "categorySlugs": categories[]->slug.current,
      tags
    }
  `
  const posts = await safeFetch<any[]>(query, { categorySlug }, {
    context: `getPostsByCategory-${categorySlug}`,
    fallback: [],
    revalidate: 600, // 10 minutes
  })
  return (posts || []).map(transformBlogPost)
})

/**
 * Search blog posts - NO CACHE (real-time results)
 */
export async function searchBlogPosts(searchTerm: string): Promise<BlogPost[]> {
  if (!isSanityConfigured()) {
    return []
  }

  const query = `
    *[_type == "blogPost" && (
      title match $searchTerm + "*" ||
      excerpt match $searchTerm + "*" ||
      $searchTerm in tags
    ) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorImage": author->image,
      mainImage,
      "categoryTitles": categories[]->title,
      "categorySlugs": categories[]->slug.current,
      tags
    }
  `

  try {
    const posts = await client.fetch<any[]>(query, { searchTerm }, { cache: 'no-store' })
    return (posts || []).map(transformBlogPost)
  } catch (error) {
    console.error('Error searching blog posts:', error)
    return []
  }
}

// ============== SELLER POSTS ==============

/**
 * Get featured seller post with caching
 */
export const getFeaturedSellerPost = cache(async (): Promise<SellerPost | null> => {
  const post = await safeFetch<SellerPost>(FEATURED_SELLER_POST_QUERY, {}, {
    context: 'getFeaturedSellerPost',
    revalidate: 600,
  })
  return post || null
})

/**
 * Get single seller post by slug
 * ✅ Uses React cache for request deduplication + Next.js fetch cache for ISR
 */
export const getSellerPost = cache(async (slug: string): Promise<SellerPost | null> => {
  const post = await safeFetch<SellerPost>(
    SELLER_POST_QUERY,
    { slug },
    { 
      context: `getSellerPost-${slug}`,
      revalidate: 1800, // 30 minutes
    }
  )
  return post || null
})

/**
 * Get all seller posts with caching
 */
export const getSellerPosts = cache(async (): Promise<SellerPost[]> => {
  const posts = await safeFetch<SellerPost[]>(SELLER_POSTS_QUERY, {}, {
    context: 'getSellerPosts',
    fallback: [],
    revalidate: 600,
  })
  return posts || []
})

// ============== NEWSLETTERS ==============

/**
 * Get all newsletters with caching
 */
export const getNewsletters = cache(async (): Promise<Newsletter[]> => {
  const newsletters = await safeFetch<Newsletter[]>(NEWSLETTERS_QUERY, {}, {
    context: 'getNewsletters',
    fallback: [],
    revalidate: 300,
  })
  return newsletters || []
})

/**
 * Get single newsletter by ID
 */
export const getNewsletter = cache(async (id: string): Promise<Newsletter | null> => {
  const newsletter = await safeFetch<Newsletter>(
    NEWSLETTER_QUERY,
    { id },
    { 
      context: `getNewsletter-${id}`,
      revalidate: 300,
    }
  )
  return newsletter || null
})

/**
 * Get ready newsletters - NO CACHE
 */
export async function getReadyNewsletters(): Promise<Newsletter[]> {
  if (!isSanityConfigured()) {
    return []
  }

  try {
    const newsletters = await client.fetch<Newsletter[]>(
      READY_NEWSLETTERS_QUERY,
      {},
      { cache: 'no-store' }
    )
    return newsletters || []
  } catch (error) {
    console.error('Error fetching ready newsletters:', error)
    return []
  }
}

// ============== STATIC PARAMS HELPERS ==============

/**
 * Get blog post slugs for static generation
 * Returns empty array on error to allow build to succeed
 */
export async function getBlogPostSlugs(): Promise<string[]> {
  const slugs = await safeFetch<string[]>(BLOG_POST_SLUGS_QUERY, {}, {
    context: 'getBlogPostSlugs',
    timeout: 10000,
    retries: 1,
    fallback: [],
  })
  return (slugs || []).filter(Boolean)
}

/**
 * Get seller post slugs for static generation
 */
export async function getSellerPostSlugs(): Promise<string[]> {
  const slugs = await safeFetch<string[]>(SELLER_POST_SLUGS_QUERY, {}, {
    context: 'getSellerPostSlugs',
    timeout: 10000,
    retries: 1,
    fallback: [],
  })
  return (slugs || []).filter(Boolean)
}

/**
 * Get category slugs for static generation
 */
export async function getCategorySlugs(): Promise<string[]> {
  const slugs = await safeFetch<string[]>(CATEGORY_SLUGS_QUERY, {}, {
    context: 'getCategorySlugs',
    timeout: 10000,
    retries: 1,
    fallback: [],
  })
  return (slugs || []).filter(Boolean)
}

/**
 * @deprecated Use Next.js revalidateTag() in webhooks instead
 */
export async function invalidateBlogCache(
  type?: 'posts' | 'categories' | 'sellers' | 'newsletters'
) {
  console.log('invalidateBlogCache is deprecated - use Next.js revalidateTag() in webhooks')
}