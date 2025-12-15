import { MetadataRoute } from 'next'
import { listProducts } from '@/lib/data/products'
import { getBlogPosts } from './[locale]/(main)/blog/lib/data'
import {
  listCategories,
  getCategoriesWithProductsFromDatabase,
} from '@/lib/data/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'https://artovnia.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/promotions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sellers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/how-to-buy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/selling-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sellers-faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    const { response } = await listProducts({
      queryParams: { limit: 1000 },
      countryCode: 'PL',
    })

    const productPages: MetadataRoute.Sitemap = response.products.map(
      (product) => ({
        url: `${baseUrl}/products/${product.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    )

    // Get categories with products
    const categoriesData = await listCategories()
    const categoriesWithProducts =
      await getCategoriesWithProductsFromDatabase()

    const categoryPages: MetadataRoute.Sitemap = categoriesData.categories
      .filter((category) => categoriesWithProducts.has(category.id))
      .map((category) => {
        const isParent = !category.parent_category_id
        const priority = isParent ? 0.7 : 0.6

        return {
          url: `${baseUrl}/categories/${category.handle}`,
          lastModified: new Date(category.updated_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority,
        }
      })

    // Blog posts - FIX: Access slug.current
    const posts = await getBlogPosts()
    const blogPages: MetadataRoute.Sitemap = posts
      .filter((post) => post.slug?.current) // Filter out posts without slugs
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug.current}`, // ✅ Fixed!
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))

    return [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...blogPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}