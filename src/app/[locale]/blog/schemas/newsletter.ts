import { defineType } from 'sanity'

export default defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Newsletter Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'subject',
      title: 'Email Subject',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'previewText',
      title: 'Preview Text',
      type: 'string',
      description: 'Text shown in email preview (optional)'
    },
    {
      name: 'templateType',
      title: 'Template Type',
      type: 'string',
      options: {
        list: [
          { title: 'New Products', value: 'new_products' },
          { title: 'Promotions', value: 'promotions' },
          { title: 'Best Sellers', value: 'best_sellers' },
          { title: 'Seller Spotlight', value: 'seller_spotlight' },
          { title: 'Custom Content', value: 'custom' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Newsletter Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' }
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
                    type: 'url'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text'
            }
          ]
        },
        {
          name: 'ctaButton',
          title: 'Call to Action Button',
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Button Text',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'url',
              title: 'Button URL',
              type: 'url',
              validation: Rule => Rule.required()
            },
            {
              name: 'style',
              title: 'Button Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary', value: 'primary' },
                  { title: 'Secondary', value: 'secondary' }
                ]
              },
              initialValue: 'primary'
            }
          ]
        },
        {
          name: 'productShowcase',
          title: 'Product Showcase',
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Section Title',
              type: 'string'
            },
            {
              name: 'productIds',
              title: 'Product IDs',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Enter Medusa product IDs to showcase'
            }
          ]
        }
      ]
    },
    {
      name: 'scheduledSendDate',
      title: 'Scheduled Send Date',
      type: 'datetime',
      description: 'When to send this newsletter (optional - leave empty for manual send)'
    },
    {
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'string',
      options: {
        list: [
          { title: 'All Subscribers', value: 'all' },
          { title: 'New Subscribers', value: 'new' },
          { title: 'Active Customers', value: 'customers' },
          { title: 'Inactive Subscribers', value: 'inactive' }
        ]
      },
      initialValue: 'all'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Ready to Send', value: 'ready' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Sent', value: 'sent' }
        ]
      },
      initialValue: 'draft'
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'Set this when newsletter is ready to send'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subject: 'subject',
      status: 'status',
      publishedAt: 'publishedAt'
    },
    prepare(selection) {
      const { title, subject, status, publishedAt } = selection
      return {
        title: title,
        subtitle: `${subject} • ${status}${publishedAt ? ` • ${new Date(publishedAt).toLocaleDateString()}` : ''}`,
        media: () => '📧'
      }
    }
  }
})
