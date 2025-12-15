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
    // Fetch products with error handling
    let productPages: MetadataRoute.Sitemap = []
    try {
      const { response } = await listProducts({
        queryParams: { limit: 1000 },
        countryCode: 'PL',
      })

      console.log(`✅ Sitemap: Found ${response.products.length} products`)

    productPages = response.products
  .filter((product) => product.handle)
  .map((product) => ({
    url: `${baseUrl}/products/${product.handle}`,
    lastModified: product.created_at 
      ? new Date(product.created_at) 
      : new Date(), // Fallback if created_at is undefined
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
    } catch (error) {
      console.error('❌ Sitemap: Error fetching products:', error)
    }

    // Fetch categories with error handling
    let categoryPages: MetadataRoute.Sitemap = []
    try {
      const categoriesData = await listCategories()
      const categoriesWithProducts =
        await getCategoriesWithProductsFromDatabase()

      console.log(
        `✅ Sitemap: Found ${categoriesData.categories.length} total categories, ${categoriesWithProducts.size} with products`
      )

      categoryPages = categoriesData.categories
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
    } catch (error) {
      console.error('❌ Sitemap: Error fetching categories:', error)
    }

    // Fetch blog posts with error handling
    let blogPages: MetadataRoute.Sitemap = []
    try {
      const posts = await getBlogPosts()

      console.log(`✅ Sitemap: Found ${posts.length} blog posts`)

      blogPages = posts
        .filter((post) => post.slug?.current)
        .map((post) => ({
          url: `${baseUrl}/blog/${post.slug.current}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
    } catch (error) {
      console.error('❌ Sitemap: Error fetching blog posts:', error)
    }

    // Fetch seller pages with error handling
    let sellerPages: MetadataRoute.Sitemap = []
    try {
      // Get unique sellers from products
      const { response } = await listProducts({
        queryParams: { limit: 1000 },
        countryCode: 'PL',
      })

      const uniqueSellers = new Map<string, any>()
      response.products.forEach((product) => {
        if (product.seller?.handle && !uniqueSellers.has(product.seller.handle)) {
          uniqueSellers.set(product.seller.handle, product.seller)
        }
      })

      console.log(`✅ Sitemap: Found ${uniqueSellers.size} sellers`)

      sellerPages = Array.from(uniqueSellers.values()).map((seller) => ({
        url: `${baseUrl}/sellers/${seller.handle}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    } catch (error) {
      console.error('❌ Sitemap: Error fetching sellers:', error)
    }

    const allPages = [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...blogPages,
      ...sellerPages,
    ]

    console.log(`✅ Sitemap: Generated ${allPages.length} total URLs`)
    console.log(`   - ${staticPages.length} static pages`)
    console.log(`   - ${productPages.length} products`)
    console.log(`   - ${categoryPages.length} categories`)
    console.log(`   - ${blogPages.length} blog posts`)
    console.log(`   - ${sellerPages.length} sellers`)

    return allPages
  } catch (error) {
    console.error('❌ Sitemap: Critical error:', error)
    return staticPages
  }
}