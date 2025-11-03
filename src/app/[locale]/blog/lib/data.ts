import { client, BLOG_POSTS_QUERY, BLOG_POST_QUERY, BLOG_CATEGORIES_QUERY, FEATURED_POSTS_QUERY, FEATURED_SELLER_POST_QUERY, SELLER_POST_QUERY, SELLER_POSTS_QUERY, NEWSLETTERS_QUERY, NEWSLETTER_QUERY, READY_NEWSLETTERS_QUERY } from './sanity'
import { unifiedCache } from '@/lib/utils/unified-cache'

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  excerpt?: string
  content?: any
  publishedAt: string
  // Optimized flat structure instead of nested objects
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
  // Legacy support for existing components
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
  sellerHandle: string
  mainImage?: any
  secondaryImage?: any
  content?: any
  linkedProducts?: Array<{
    productId: string
    productHandle: string
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

// Transform optimized data to legacy format for backward compatibility
function transformBlogPost(post: any): BlogPost {
  return {
    ...post,
    author: post.authorName ? {
      name: post.authorName,
      bio: post.authorBio,
      image: post.authorImage
    } : undefined,
    categories: post.categoryTitles ? post.categoryTitles.map((title: string, index: number) => ({
      title,
      slug: { current: post.categorySlugs?.[index] || '' }
    })) : undefined
  }
}

// OPTIMIZED: Fetch all blog posts with unified cache
export async function getBlogPosts(): Promise<BlogPost[]> {
  return unifiedCache.get('blog:posts:all', async () => {
    try {
      const posts = await client.fetch(BLOG_POSTS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch featured blog posts with unified cache
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  return unifiedCache.get('blog:posts:featured', async () => {
    try {
      const posts = await client.fetch(FEATURED_POSTS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching featured posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch latest blog posts using unified cache
export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  return unifiedCache.get('blog:posts:latest', async () => {
    try {
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
      const posts = await client.fetch(query, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching latest blog posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch single blog post with unified cache
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return unifiedCache.get(`blog:post:${slug}`, async () => {
    try {
      const post = await client.fetch(BLOG_POST_QUERY, { slug }, {
        cache: 'force-cache',
        next: { revalidate: 1800 }, // 30 minutes for individual posts
      })
      return post ? transformBlogPost(post) : null
    } catch (error) {
      console.error(`Error fetching blog post (slug: ${slug}):`, error)
      return null
    }
  })
}

// Fetch all blog categories with unified cache
export async function getBlogCategories(): Promise<BlogCategory[]> {
  return unifiedCache.get('blog:categories:all', async () => {
    try {
      const categories = await client.fetch(BLOG_CATEGORIES_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 3600 }, // 1 hour cache for categories (they change less frequently)
      })
      return categories || []
    } catch (error) {
      console.error('Error fetching blog categories:', error)
      return []
    }
  })
}

// Fetch posts by category with unified cache
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  return unifiedCache.get(`blog:posts:category:${categorySlug}`, async () => {
    try {
      const query = `
        *[_type == "blogPost" && references(*[_type == "blogCategory" && slug.current == $categorySlug]._id) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          author->{
            name,
            image
          },
          mainImage,
          categories[]->{
            title,
            slug
          },
          tags
        }
      `
      const posts = await client.fetch(query, { categorySlug }, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return posts || []
    } catch (error) {
      console.error('Error fetching posts by category:', error)
      return []
    }
  })
}

// Search blog posts (no cache for search results as they should be real-time)
export async function searchBlogPosts(searchTerm: string): Promise<BlogPost[]> {
  // Use unified cache for search with short TTL since search results should be relatively fresh
  return unifiedCache.get(`blog:search:${searchTerm.toLowerCase()}`, async () => {
    try {
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
          author->{
            name,
            image
          },
          mainImage,
          categories[]->{
            title,
            slug
          },
          tags
        }
      `
      const posts = await client.fetch(query, { searchTerm }, {
        cache: 'no-store', // Don't use Next.js cache for search
      })
      return posts || []
    } catch (error) {
      console.error('Error searching blog posts:', error)
      return []
    }
  })
}

// Fetch featured seller post for homepage with unified cache
export async function getFeaturedSellerPost(): Promise<SellerPost | null> {
  return unifiedCache.get('blog:seller:featured', async () => {
    try {
      const post = await client.fetch(FEATURED_SELLER_POST_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return post || null
    } catch (error) {
      console.error('Error fetching featured seller post:', error)
      return null
    }
  })
}

// OPTIMIZED: Fetch single seller post with unified cache
export async function getSellerPost(slug: string): Promise<SellerPost | null> {
  return unifiedCache.get(`blog:seller:post:${slug}`, async () => {
    try {
      const post = await client.fetch(SELLER_POST_QUERY, { slug }, {
        cache: 'force-cache',
        next: { revalidate: 1800 }, // 30 minutes for individual posts
      })
      return post || null
    } catch (error) {
      console.error(`Error fetching seller post (slug: ${slug}):`, error)
      return null
    }
  })
}

// Fetch all seller posts with unified cache
export async function getSellerPosts(): Promise<SellerPost[]> {
  return unifiedCache.get('blog:seller:posts:all', async () => {
    try {
      const posts = await client.fetch(SELLER_POSTS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // 10 minutes cache
      })
      return posts || []
    } catch (error) {
      console.error('Error fetching seller posts:', error)
      return []
    }
  })
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

// Newsletter data fetching functions with unified cache
export async function getNewsletters(): Promise<Newsletter[]> {
  return unifiedCache.get('blog:newsletters:all', async () => {
    try {
      const newsletters = await client.fetch(NEWSLETTERS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 300 }, // 5 minutes cache
      })
      return newsletters || []
    } catch (error) {
      console.error('Error fetching newsletters:', error)
      return []
    }
  })
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  return unifiedCache.get(`blog:newsletter:${id}`, async () => {
    try {
      const newsletter = await client.fetch(NEWSLETTER_QUERY, { id }, {
        cache: 'force-cache',
        next: { revalidate: 300 }, // 5 minutes cache
      })
      return newsletter || null
    } catch (error) {
      console.error(`Error fetching newsletter (id: ${id}):`, error)
      return null
    }
  })
}

// Ready newsletters shouldn't be cached as aggressively since they change status quickly
export async function getReadyNewsletters(): Promise<Newsletter[]> {
  return unifiedCache.get('blog:newsletters:ready', async () => {
    try {
      const newsletters = await client.fetch(READY_NEWSLETTERS_QUERY, {}, {
        cache: 'no-store', // Don't use Next.js cache
      })
      return newsletters || []
    } catch (error) {
      console.error('Error fetching ready newsletters:', error)
      return []
    }
  })
}
// Utility function to invalidate blog-related caches
export async function invalidateBlogCache(type?: 'posts' | 'categories' | 'sellers' | 'newsletters') {
  if (!type) {
    // Invalidate all blog caches
    await unifiedCache.invalidate('blog')
    return
  }

  switch (type) {
    case 'posts':
      unifiedCache.invalidate('blog:posts')
      break
    case 'categories':
      unifiedCache.invalidate('blog:categories')
      break
    case 'sellers':
      unifiedCache.invalidate('blog:seller')
      break
    case 'newsletters':
      unifiedCache.invalidate('blog:newsletters')
      break
  }
}