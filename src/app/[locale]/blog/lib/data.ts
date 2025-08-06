import { client, BLOG_POSTS_QUERY, BLOG_POST_QUERY, BLOG_CATEGORIES_QUERY, FEATURED_POSTS_QUERY } from './sanity'

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  excerpt?: string
  content?: any
  publishedAt: string
  author?: {
    name: string
    bio?: any
    image?: any
  }
  mainImage?: any
  categories?: Array<{
    title: string
    slug: {
      current: string
    }
  }>
  tags?: string[]
  featured?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
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

// Fetch all blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch(BLOG_POSTS_QUERY, {}, {
      cache: 'force-cache',
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

// Fetch featured blog posts
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  try {
    const posts = await client.fetch(FEATURED_POSTS_QUERY, {}, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    })
    return posts || []
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }
}

// Fetch single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await client.fetch(BLOG_POST_QUERY, { slug }, {
      cache: 'force-cache',
      next: { revalidate: 300 },
    })
    return post || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
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
