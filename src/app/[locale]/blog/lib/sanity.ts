import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET environment variable')
}

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true, // Always use CDN for better performance
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published', // Only fetch published content for better caching
  stega: false, // Disable stega for production performance
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// OPTIMIZED GROQ queries for blog posts - reduced references for better performance
export const BLOG_POSTS_QUERY = `
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
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

export const BLOG_POST_QUERY = `
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    publishedAt,
    "authorName": author->name,
    "authorBio": author->bio,
    "authorImage": author->image,
    mainImage,
    "categoryTitles": categories[]->title,
    "categorySlugs": categories[]->slug.current,
    tags,
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`

export const BLOG_CATEGORIES_QUERY = `
  *[_type == "blogCategory"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`

export const FEATURED_POSTS_QUERY = `
  *[_type == "blogPost" && featured == true && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    "authorName": author->name,
    "authorImage": author->image,
    mainImage,
    "categoryTitles": categories[]->title,
    "categorySlugs": categories[]->slug.current
  }
`

// GROQ queries for seller posts
export const FEATURED_SELLER_POST_QUERY = `
  *[_type == "sellerPost" && featuredOnHomepage == true && !(_id in path("drafts.**"))] | order(publishedAt desc)[0] {
    _id,
    title,
    slug,
    sellerName,
    shortDescription,
    sellerHandle,
    mainImage,
    secondaryImage,
    publishedAt
  }
`

export const SELLER_POST_QUERY = `
  *[_type == "sellerPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    sellerName,
    shortDescription,
    sellerHandle,
    mainImage,
    secondaryImage,
    content,
    linkedProducts[] {
      productId,
      productName,
      productImage
    },
    publishedAt,
    seo {
      metaTitle,
      metaDescription,
      keywords
    }
  }
`

export const SELLER_POSTS_QUERY = `
  *[_type == "sellerPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    sellerName,
    shortDescription,
    sellerHandle,
    mainImage,
    publishedAt
  }
`
