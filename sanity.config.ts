import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './src/app/[locale]/blog/schemas'

export default defineConfig({
  name: 'default',
  title: 'Artovnia Blog',

  projectId: 'o56rau04',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Webhook configuration for automated blog post newsletters and newsletter campaigns
  webhooks: [
    {
      name: 'blog-post-newsletter',
      url: 'https://artovnia-production.up.railway.app/store/blog/webhook',
      events: ['create', 'update'],
      filter: '_type == "blogPost" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_01JVWG4XRHFKCCEV9JWZFXS4GJ'
      }
    },
    {
      name: 'newsletter-campaign',
      url: 'https://artovnia-production.up.railway.app/store/newsletter/webhook',
      events: ['create', 'update'],
      filter: '_type == "newsletter" && status == "ready" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': 'pk_01JVWG4XRHFKCCEV9JWZFXS4GJ'
      }
    }
  ]
})
