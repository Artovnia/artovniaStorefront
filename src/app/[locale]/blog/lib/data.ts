import { client, BLOG_POSTS_QUERY, BLOG_POST_QUERY, BLOG_CATEGORIES_QUERY, FEATURED_POSTS_QUERY, FEATURED_SELLER_POST_QUERY, SELLER_POST_QUERY, SELLER_POSTS_QUERY } from './sanity'
import { RequestDeduplicator } from '@/lib/utils/performance'

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

// Create blog-specific deduplicator
const blogDeduplicator = new RequestDeduplicator()

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

// OPTIMIZED: Fetch all blog posts with deduplication and better caching
export async function getBlogPosts(): Promise<BlogPost[]> {
  return blogDeduplicator.dedupe('blog-posts-all', async () => {
    try {
      const posts = await client.fetch(BLOG_POSTS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // Increased to 10 minutes for better performance
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch featured blog posts with deduplication
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  return blogDeduplicator.dedupe('blog-posts-featured', async () => {
    try {
      const posts = await client.fetch(FEATURED_POSTS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 600 }, // Increased cache duration
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching featured posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch latest blog posts using optimized query
export async function getLatestBlogPosts(): Promise<BlogPost[]> {
  return blogDeduplicator.dedupe('blog-posts-latest', async () => {
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
        next: { revalidate: 600 }, // Increased cache duration
      })
      return (posts || []).map(transformBlogPost)
    } catch (error) {
      console.error('Error fetching latest blog posts:', error)
      return []
    }
  })
}

// OPTIMIZED: Fetch single blog post with deduplication and no retry delays
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return blogDeduplicator.dedupe(`blog-post-${slug}`, async () => {
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

// Fetch all blog categories
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const categories = await client.fetch(BLOG_CATEGORIES_QUERY, {}, {
      cache: 'force-cache',
      next: { revalidate: 600 }, // Revalidate every 10 minutes
    })
    return categories || []
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

// Fetch posts by category
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
      cache: 'force-cache',
      next: { revalidate: 300 },
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
}

// Search blog posts
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

// Fetch featured seller post for homepage
export async function getFeaturedSellerPost(): Promise<SellerPost | null> {
  try {
    const post = await client.fetch(FEATURED_SELLER_POST_QUERY, {}, {
      cache: 'force-cache',
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    return post || null
  } catch (error) {
    console.error('Error fetching featured seller post:', error)
    return null
  }
}

// OPTIMIZED: Fetch single seller post with deduplication and no retry delays
export async function getSellerPost(slug: string): Promise<SellerPost | null> {
  return blogDeduplicator.dedupe(`seller-post-${slug}`, async () => {
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

// Fetch all seller posts
export async function getSellerPosts(): Promise<SellerPost[]> {
  try {
    const posts = await client.fetch(SELLER_POSTS_QUERY, {}, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching seller posts:', error)
    return []
  }
}
