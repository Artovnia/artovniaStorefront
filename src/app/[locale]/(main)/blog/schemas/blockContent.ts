import { defineType, defineArrayMember } from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'codeBlock',
      title: 'Code Block',
      fields: [
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Python', value: 'python' },
              { title: 'JSON', value: 'json' },
              { title: 'Bash', value: 'bash' },
            ],
          },
        },
        {
          name: 'code',
          title: 'Code',
          type: 'text',
          rows: 10,
        },
      ],
      preview: {
        select: {
          title: 'language',
          subtitle: 'code',
        },
        prepare({ title, subtitle }) {
          return {
            title: `Code: ${title || 'Plain text'}`,
            subtitle: subtitle ? `${subtitle.slice(0, 50)}...` : '',
          }
        },
      },
    }),
    // Product Carousel - displays products from the shop within blog posts
    defineArrayMember({
      type: 'object',
      name: 'productCarousel',
      title: 'Product Carousel',
      fields: [
        {
          name: 'title',
          title: 'Carousel Title',
          type: 'string',
          description: 'Optional title displayed above the carousel (e.g., "Polecane produkty")',
        },
        {
          name: 'products',
          title: 'Products',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'productItem',
              title: 'Product',
              fields: [
                {
                  name: 'productHandle',
                  title: 'Product Handle (URL slug)',
                  type: 'string',
                  description: 'The product handle from your shop URL (e.g., "handmade-ceramic-vase")',
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'customTitle',
                  title: 'Custom Title (optional)',
                  type: 'string',
                  description: 'Override the product title if needed',
                },
              ],
              preview: {
                select: {
                  title: 'productHandle',
                  subtitle: 'customTitle',
                },
                prepare(selection) {
                  const { title, subtitle } = selection as { title: string; subtitle?: string }
                  return {
                    title: subtitle || title,
                    subtitle: subtitle ? `Handle: ${title}` : 'Product from shop',
                  }
                },
              },
            },
          ],
          validation: (Rule: any) => Rule.min(1).max(12).error('Add between 1 and 12 products'),
        },
        {
          name: 'showPrices',
          title: 'Show Prices',
          type: 'boolean',
          initialValue: true,
          description: 'Display product prices in the carousel',
        },
        {
          name: 'showSellerName',
          title: 'Show Seller Name',
          type: 'boolean',
          initialValue: true,
          description: 'Display seller/artist name below product title',
        },
      ],
      preview: {
        select: {
          title: 'title',
          products: 'products',
        },
        prepare(selection) {
          const { title, products } = selection as { title?: string; products?: any[] }
          const productCount = products?.length || 0
          return {
            title: title || 'Product Carousel',
            subtitle: `${productCount} product${productCount !== 1 ? 's' : ''}`,
          }
        },
      },
    }),
  ],
})
