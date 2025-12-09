import {defineCliConfig} from 'sanity/cli'

// Use environment variables if available, otherwise use hardcoded values
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'pbhdm7sqrkujay1uxrxz71r1'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset
  },
  deployment: {
    appId: 'pbhdm7sqrkujay1uxrxz71r1'
  }
})
