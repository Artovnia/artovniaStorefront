import { MetadataRoute } from 'next'
import { listProductsForSitemap } from '@/lib/data/products-sitemap'
import { getBlogPosts } from './[locale]/(main)/blog/lib/data'
import {
  listCategories,
  getCategoriesWithProductsFromDatabase,
} from '@/lib/data/categories'
import { getSellers } from '@/lib/data/seller'

// Helper function to add timeout to any promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]).catch(() => {
    console.warn(`⏱️ Sitemap: Operation timed out after ${timeoutMs}ms, using fallback`)
    return fallback
  })
}

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
    // Fetch all data in parallel with timeouts
    const [productsResult, categoriesResult, blogResult, sellersResult] = await Promise.allSettled([
      // Products with 20-second timeout - using sitemap-specific function
      withTimeout(
        listProductsForSitemap({ limit: 1000 }),
        20000,
        { products: [], count: 0 }
      ),
      // Categories with 15-second timeout
      withTimeout(
        Promise.all([
          listCategories(),
          getCategoriesWithProductsFromDatabase()
        ]),
        15000,
        [{ categories: [], parentCategories: [] }, new Set<string>()]
      ),
      // Blog posts with 10-second timeout
      withTimeout(
        getBlogPosts(),
        10000,
        []
      ),
      // Sellers with 15-second timeout
      withTimeout(
        getSellers({ limit: 1000 }),
        15000,
        { sellers: [], count: 0, limit: 1000, offset: 0 }
      )
    ])

    // Extract products
    let productPages: MetadataRoute.Sitemap = []
    
    if (productsResult.status === 'fulfilled') {
      const { products } = productsResult.value
      console.log(`✅ Sitemap: Found ${products.length} products`)
      
      productPages = products
        .filter((product) => product.handle)
        .map((product) => ({
          url: `${baseUrl}/products/${product.handle}`,
          lastModified: product.updated_at
            ? new Date(product.updated_at)
            : product.created_at
              ? new Date(product.created_at)
              : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    } else {
      console.error('❌ Sitemap: Error fetching products:', productsResult.reason)
    }

    // Extract categories
    let categoryPages: MetadataRoute.Sitemap = []
    if (categoriesResult.status === 'fulfilled') {
      const [categoriesData, categoriesWithProducts] = categoriesResult.value
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
    } else {
      console.error('❌ Sitemap: Error fetching categories:', categoriesResult.reason)
    }

    // Extract blog posts
    let blogPages: MetadataRoute.Sitemap = []
    if (blogResult.status === 'fulfilled') {
      const posts = blogResult.value
      console.log(`✅ Sitemap: Found ${posts.length} blog posts`)

      blogPages = posts
        .filter((post) => post.slug?.current)
        .map((post) => ({
          url: `${baseUrl}/blog/${post.slug.current}`,
          lastModified: new Date(post.publishedAt),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
    } else {
      console.error('❌ Sitemap: Error fetching blog posts:', blogResult.reason)
    }

    // Extract sellers
    let sellerPages: MetadataRoute.Sitemap = []
    if (sellersResult.status === 'fulfilled') {
      const { sellers } = sellersResult.value
      console.log(`✅ Sitemap: Found ${sellers.length} sellers`)
      
      sellerPages = sellers
        .filter((seller) => seller.handle)
        .map((seller) => ({
          url: `${baseUrl}/sellers/${seller.handle}`,
          lastModified: new Date(seller.created_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
    } else {
      console.error('❌ Sitemap: Error fetching sellers:', sellersResult.reason)
    }

    const allPages = [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...blogPages,
      ...sellerPages,
    ]


    return allPages
  } catch (error) {
    console.error('❌ Sitemap: Critical error:', error)
    return staticPages
  }
}