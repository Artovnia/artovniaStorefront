import { client, BLOG_POSTS_QUERY, BLOG_POST_QUERY, BLOG_CATEGORIES_QUERY, FEATURED_POSTS_QUERY, FEATURED_SELLER_POST_QUERY, SELLER_POST_QUERY, SELLER_POSTS_QUERY, NEWSLETTERS_QUERY, NEWSLETTER_QUERY, READY_NEWSLETTERS_QUERY } from './sanity'
// ✅ Removed unified-cache - using only Next.js ISR to avoid cache layer conflicts

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
  sellerUrl: string // Full URL to seller store page
  mainImage?: any
  secondaryImage?: any
  content?: any
  linkedProducts?: Array<{
    productUrl: string // Full URL to product page
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

// ✅ Single cache layer: Next.js ISR only
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch(BLOG_POSTS_QUERY, {}, {
      next: { revalidate: 60 }, // 1 minute cache
    })
    return (posts || []).map(transformBlogPost)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch(FEATURED_POSTS_QUERY, {}, {
      next: { revalidate: 60 }, // 1 minute cache
    })
    return (posts || []).map(transformBlogPost)
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getLatestBlogPosts(): Promise<BlogPost[]> {
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
      next: { revalidate: 60 }, // 1 minute cache
    })
    return (posts || []).map(transformBlogPost)
  } catch (error) {
    console.error('Error fetching latest blog posts:', error)
    return []
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await client.fetch(BLOG_POST_QUERY, { slug }, {
      next: { revalidate: 1800 }, // 30 minutes for individual posts
    })
    return post ? transformBlogPost(post) : null
  } catch (error) {
    console.error(`Error fetching blog post (slug: ${slug}):`, error)
    return null
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const categories = await client.fetch(BLOG_CATEGORIES_QUERY, {}, {
      next: { revalidate: 3600 }, // 1 hour cache for categories
    })
    return categories || []
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
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
      next: { revalidate: 600 }, // 10 minutes cache
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
}

// ✅ Search has no cache (real-time results)
export async function searchBlogPosts(searchTerm: string): Promise<BlogPost[]> {
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
      cache: 'no-store', // Don't cache search results
    })
    return posts || []
  } catch (error) {
    console.error('Error searching blog posts:', error)
    return []
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getFeaturedSellerPost(): Promise<SellerPost | null> {
  try {
    const post = await client.fetch(FEATURED_SELLER_POST_QUERY, {}, {
      next: { revalidate: 600 }, // 10 minutes cache
    })
    return post || null
  } catch (error) {
    console.error('Error fetching featured seller post:', error)
    return null
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getSellerPost(slug: string): Promise<SellerPost | null> {
  try {
    const post = await client.fetch(SELLER_POST_QUERY, { slug }, {
      next: { revalidate: 1800 }, // 30 minutes for individual posts
    })
    return post || null
  } catch (error) {
    console.error(`Error fetching seller post (slug: ${slug}):`, error)
    return null
  }
}

// ✅ Single cache layer: Next.js ISR only
export async function getSellerPosts(): Promise<SellerPost[]> {
  try {
    const posts = await client.fetch(SELLER_POSTS_QUERY, {}, {
      next: { revalidate: 600 }, // 10 minutes cache
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching seller posts:', error)
    return []
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

// ✅ Single cache layer: Next.js ISR only
export async function getNewsletters(): Promise<Newsletter[]> {
  try {
    const newsletters = await client.fetch(NEWSLETTERS_QUERY, {}, {
      next: { revalidate: 300 }, // 5 minutes cache
    })
    return newsletters || []
  } catch (error) {
    console.error('Error fetching newsletters:', error)
    return []
  }
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  try {
    const newsletter = await client.fetch(NEWSLETTER_QUERY, { id }, {
      next: { revalidate: 300 }, // 5 minutes cache
    })
    return newsletter || null
  } catch (error) {
    console.error(`Error fetching newsletter (id: ${id}):`, error)
    return null
  }
}

// Ready newsletters shouldn't be cached since they change status quickly
export async function getReadyNewsletters(): Promise<Newsletter[]> {
  try {
    const newsletters = await client.fetch(READY_NEWSLETTERS_QUERY, {}, {
      cache: 'no-store', // Don't cache
    })
    return newsletters || []
  } catch (error) {
    console.error('Error fetching ready newsletters:', error)
    return []
  }
}
// ✅ Cache invalidation now handled by Next.js revalidateTag() or revalidatePath()
// Use this in Sanity webhooks: revalidateTag('blog') or revalidatePath('/blog')
export async function invalidateBlogCache(type?: 'posts' | 'categories' | 'sellers' | 'newsletters') {
  // This function is deprecated - use Next.js revalidateTag() instead
  console.log('invalidateBlogCache is deprecated - use Next.js revalidateTag() in webhooks')
}