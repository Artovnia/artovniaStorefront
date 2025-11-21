import { SellerProps } from "@/types/seller"
import { sdk } from "../config"

export const getSellerByHandle = async (handle: string): Promise<SellerProps | null> => {
  try {
    const { seller } = await sdk.client
      .fetch<{ seller: SellerProps }>(`/store/seller/${handle}`, {
        query: {
          fields:
            "+created_at,+rating,+email", // Removed *reviews references
        },
        next: { revalidate: 300 }, // ✅ Cache for 5 minutes (matches getSellers duration)
      });
      
    if (!seller) return null;
      
    const response = {
      ...seller,
      reviews: [], // Initialize with empty array since reviews are fetched separately
    };

    return response as SellerProps;
  } catch (error) {
    console.error(`Error fetching seller with handle ${handle}:`, error);
    return null;
  }
}

interface SellerListResponse {
  sellers: SellerProps[]
  count: number
  limit: number
  offset: number
}

export const getSellers = async (params?: {
  limit?: number
  offset?: number
  letter?: string
  sortBy?: string
}): Promise<SellerListResponse> => {
  try {
    const queryParams = new URLSearchParams()
    
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.letter) queryParams.append('letter', params.letter)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    
    queryParams.append('fields', 'id,handle,name,description,logo_url,created_at')

    const response = await sdk.client
      .fetch<SellerListResponse>(`/store/sellers?${queryParams.toString()}`, {
        next: { revalidate: 300 }, // ✅ Cache for 5 minutes (sellers don't change that often)
      });

    return response;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return {
      sellers: [],
      count: 0,
      limit: params?.limit || 20,
      offset: params?.offset || 0
    };
  }
}