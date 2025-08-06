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
})
