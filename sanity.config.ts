import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './src/app/[locale]/(main)/blog/schemas'

// Hardcoded values for hosted Studio (env vars not available in browser)
const SANITY_PROJECT_ID = 'pbhdm7sqrkujay1uxrxz71r1'
const SANITY_DATASET = 'production'
const MEDUSA_BACKEND_URL = 'https://api.artovnia.com'
const MEDUSA_PUBLISHABLE_KEY = 'pk_9b62a68d7f80abcba6611a3711beadbed895d9a256b4b11af7930add016b0182'

export default defineConfig({
  name: 'default',
  title: 'Artovnia Blog',

  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  // Webhook configuration for automated blog post newsletters and newsletter campaigns
  webhooks: [
    {
      name: 'blog-post-newsletter',
      url: `${MEDUSA_BACKEND_URL}/store/blog/webhook`,
      events: ['create', 'update'],
      filter: '_type == "blogPost" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY
      }
    },
    {
      name: 'newsletter-campaign',
      url: `${MEDUSA_BACKEND_URL}/store/newsletter/webhook`,
      events: ['create', 'update'],
      filter: '_type == "newsletter" && status == "ready" && defined(publishedAt)',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY
      }
    }
  ]
})
