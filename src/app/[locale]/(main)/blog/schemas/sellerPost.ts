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
      name: 'sellerHandle',
      title: 'Seller Handle/URL',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Seller handle for store URL (e.g., "app-crates" for /sellers/app-crates)',
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
              name: 'productId',
              title: 'Product ID',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Medusa product ID',
            }),
            defineField({
              name: 'productHandle',
              title: 'Product Handle',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'Product URL handle (e.g., "stolik-pod-obraz-1747921701916-9falth")',
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
            }),
          ],
          preview: {
            select: {
              title: 'productName',
              media: 'productImage',
            },
          },
        }
      ],
      description: 'Products to feature in the article',
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
