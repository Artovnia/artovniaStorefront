import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'sellerPost',
  title: 'Seller/Artist Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sellerName',
      title: 'Seller/Artist Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the seller/artist being featured',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
      description: 'Brief description for homepage display (max 200 characters)',
    }),
    defineField({
      name: 'sellerUrl',
      title: 'Seller Store URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({
        scheme: ['http', 'https']
      }),
      description: 'Full URL to seller store page (e.g., "https://www.artovnia.com/sellers/ann-sayuri-art-anna-wawrzyniak")',
      placeholder: 'https://www.artovnia.com/sellers/seller-handle',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required(),
        }
      ],
      validation: (Rule) => Rule.required(),
      description: 'Primary image displayed prominently on homepage',
    }),
    defineField({
      name: 'secondaryImage',
      title: 'Secondary Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required(),
        }
      ],
      validation: (Rule) => Rule.required(),
      description: 'Secondary image displayed alongside main image on homepage',
    }),
    defineField({
      name: 'content',
      title: 'Article Content',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
      description: 'Full article content about the seller/artist',
    }),
    defineField({
      name: 'linkedProducts',
      title: 'Featured Products',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'productUrl',
              title: 'Product URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({
                scheme: ['http', 'https']
              }),
              description: 'Full URL to product page (e.g., "https://www.artovnia.com/products/stolik-pod-obraz-1747921701916-9falth")',
              placeholder: 'https://www.artovnia.com/products/product-handle',
            }),
            defineField({
              name: 'productName',
              title: 'Product Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Display name for the product',
            }),
            defineField({
              name: 'productImage',
              title: 'Product Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative Text',
                }
              ],
              description: 'Product image (optional - will be fetched from URL if not provided)',
            }),
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'productUrl',
              media: 'productImage',
            },
          },
        }
      ],
      description: 'Products to feature in the article (use full product URLs from storefront)',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredOnHomepage',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as true to display in "Projektant tygodnia" section',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            layout: 'tags',
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sellerName: 'sellerName',
      media: 'mainImage',
      featured: 'featuredOnHomepage',
    },
    prepare(selection) {
      const { sellerName, featured } = selection
      return { 
        ...selection, 
        subtitle: `${sellerName}${featured ? ' • Featured' : ''}` 
      }
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featuredOnHomepage', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
  ],
})
