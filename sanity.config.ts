import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from '@/app/[locale]/(main)/blog/schemas'

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET environment variable')
}

if (!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY environment variable')
}

if (!process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  throw new Error('Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable')
}

export default defineConfig({
  name: 'default',
  title: 'Artovnia Blog',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Webhook configuration for automated blog post newsletters and newsletter campaigns
  webhooks: [
    {
      name: 'blog-post-newsletter',
      url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/blog/webhook`,
      events: ['create', 'update'],
      filter: '_type == "blogPost" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      }
    },
    {
      name: 'newsletter-campaign',
      url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/newsletter/webhook`,
      events: ['create', 'update'],
      filter: '_type == "newsletter" && status == "ready" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      }
    }
  ]
})
