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
  useCdn: process.env.NODE_ENV === 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ queries for blog posts
export const BLOG_POSTS_QUERY = `
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
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

export const BLOG_POST_QUERY = `
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    publishedAt,
    author->{
      name,
      bio,
      image
    },
    mainImage,
    categories[]->{
      title,
      slug
    },
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
    author->{
      name,
      image
    },
    mainImage,
    categories[]->{
      title,
      slug
    }
  }
`
