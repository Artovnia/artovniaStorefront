'use server'

import { sdk } from '../config'

export interface VendorPageBlock {
  id: string
  type: string
  order: number
  data: any
  motion?: {
    enter: 'none' | 'fade' | 'fade-up' | 'slide-left' | 'slide-right'
    stagger?: boolean
    delay?: number
  }
}

export interface VendorPageSettings {
  animations: 'none' | 'subtle' | 'expressive'
  primary_color?: string
  show_story_tab: boolean
}

export interface VendorPage {
  id: string
  seller_id: string
  template: 'minimal' | 'story' | 'gallery' | 'artisan'
  settings: VendorPageSettings
  blocks: VendorPageBlock[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface VendorPageResponse {
  page: VendorPage | null
  has_custom_page: boolean
}

/**
 * Fetch a seller's custom page by handle
 * Returns null if the seller doesn't have a custom page or it's not published
 */
export async function getSellerPage(handle: string): Promise<VendorPageResponse> {
  try {
    const response = await sdk.client.fetch<VendorPageResponse>(
      `/store/seller/${handle}/page`,
      {
        method: 'GET',
        next: {
          revalidate: 300, // Cache for 5 minutes
          tags: [`seller-page-${handle}`],
        },
      }
    )

    return {
      page: response.page,
      has_custom_page: response.has_custom_page ?? false,
    }
  } catch (error) {
    console.error(`Error fetching seller page for ${handle}:`, error)
    return {
      page: null,
      has_custom_page: false,
    }
  }
}
