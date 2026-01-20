import { unstable_cache } from 'next/cache'
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
 */
async function safeFetch<T>(
  query: string,
  params: Record<string, any> = {},
  options: {
    timeout?: number
    retries?: number
    context?: string
    fallback?: T
  } = {}
): Promise<T | null> {
  const { timeout = 15000, retries = 2, context = 'Sanity', fallback = null } = options

  // Return fallback if Sanity is not configured (during build)
  if (!isSanityConfigured()) {
    console.warn(`[${context}] Sanity not configured, returning fallback`)
    return fallback
  }

  try {
    return await withRetry(
      () => fetchWithTimeout<T>(query, params, timeout),
      { retries, context }
    )
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

/**
 * Get all blog posts with caching
 */
export const getBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const posts = await safeFetch<any[]>(BLOG_POSTS_QUERY, {}, {
      context: 'getBlogPosts',
      fallback: [],
    })
    return (posts || []).map(transformBlogPost)
  },
  ['blog-posts'],
  {
    revalidate: 60,
    tags: ['blog', 'blog-posts'],
  }
)

/**
 * Get featured posts with caching
 */
export const getFeaturedPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const posts = await safeFetch<any[]>(FEATURED_POSTS_QUERY, {}, {
      context: 'getFeaturedPosts',
      fallback: [],
    })
    return (posts || []).map(transformBlogPost)
  },
  ['blog-featured'],
  {
    revalidate: 60,
    tags: ['blog', 'blog-featured'],
  }
)

/**
 * Get latest 3 blog posts with caching
 */
export const getLatestBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
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
    })
    return (posts || []).map(transformBlogPost)
  },
  ['blog-latest'],
  {
    revalidate: 60,
    tags: ['blog', 'blog-latest'],
  }
)

/**
 * Get single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const getCachedPost = unstable_cache(
    async (postSlug: string): Promise<BlogPost | null> => {
      const post = await safeFetch<any>(
        BLOG_POST_QUERY,
        { slug: postSlug },
        { context: `getBlogPost(${postSlug})` }
      )
      return post ? transformBlogPost(post) : null
    },
    [`blog-post-${slug}`],
    {
      revalidate: 1800, // 30 minutes
      tags: ['blog', 'blog-posts', `blog-post-${slug}`],
    }
  )

  return getCachedPost(slug)
}

/**
 * Get blog categories with caching
 */
export const getBlogCategories = unstable_cache(
  async (): Promise<BlogCategory[]> => {
    const categories = await safeFetch<BlogCategory[]>(BLOG_CATEGORIES_QUERY, {}, {
      context: 'getBlogCategories',
      fallback: [],
    })
    return categories || []
  },
  ['blog-categories'],
  {
    revalidate: 3600, // 1 hour
    tags: ['blog', 'blog-categories'],
  }
)

/**
 * Get posts by category with caching
 */
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const getCachedPosts = unstable_cache(
    async (slug: string): Promise<BlogPost[]> => {
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
      const posts = await safeFetch<any[]>(query, { categorySlug: slug }, {
        context: `getPostsByCategory(${slug})`,
        fallback: [],
      })
      return (posts || []).map(transformBlogPost)
    },
    [`blog-category-${categorySlug}`],
    {
      revalidate: 600, // 10 minutes
      tags: ['blog', 'blog-posts', `blog-category-${categorySlug}`],
    }
  )

  return getCachedPosts(categorySlug)
}

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
export const getFeaturedSellerPost = unstable_cache(
  async (): Promise<SellerPost | null> => {
    const post = await safeFetch<SellerPost>(FEATURED_SELLER_POST_QUERY, {}, {
      context: 'getFeaturedSellerPost',
    })
    return post || null
  },
  ['seller-featured'],
  {
    revalidate: 600,
    tags: ['blog', 'sellers', 'seller-featured'],
  }
)

/**
 * Get single seller post by slug
 */
export async function getSellerPost(slug: string): Promise<SellerPost | null> {
  const getCachedPost = unstable_cache(
    async (postSlug: string): Promise<SellerPost | null> => {
      const post = await safeFetch<SellerPost>(
        SELLER_POST_QUERY,
        { slug: postSlug },
        { context: `getSellerPost(${postSlug})` }
      )
      return post || null
    },
    [`seller-post-${slug}`],
    {
      revalidate: 1800,
      tags: ['blog', 'sellers', `seller-post-${slug}`],
    }
  )

  return getCachedPost(slug)
}

/**
 * Get all seller posts with caching
 */
export const getSellerPosts = unstable_cache(
  async (): Promise<SellerPost[]> => {
    const posts = await safeFetch<SellerPost[]>(SELLER_POSTS_QUERY, {}, {
      context: 'getSellerPosts',
      fallback: [],
    })
    return posts || []
  },
  ['seller-posts'],
  {
    revalidate: 600,
    tags: ['blog', 'sellers', 'seller-posts'],
  }
)

// ============== NEWSLETTERS ==============

/**
 * Get all newsletters with caching
 */
export const getNewsletters = unstable_cache(
  async (): Promise<Newsletter[]> => {
    const newsletters = await safeFetch<Newsletter[]>(NEWSLETTERS_QUERY, {}, {
      context: 'getNewsletters',
      fallback: [],
    })
    return newsletters || []
  },
  ['newsletters'],
  {
    revalidate: 300,
    tags: ['newsletters'],
  }
)

/**
 * Get single newsletter by ID
 */
export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const getCachedNewsletter = unstable_cache(
    async (newsletterId: string): Promise<Newsletter | null> => {
      const newsletter = await safeFetch<Newsletter>(
        NEWSLETTER_QUERY,
        { id: newsletterId },
        { context: `getNewsletter(${newsletterId})` }
      )
      return newsletter || null
    },
    [`newsletter-${id}`],
    {
      revalidate: 300,
      tags: ['newsletters', `newsletter-${id}`],
    }
  )

  return getCachedNewsletter(id)
}

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