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
        cache: "force-cache",
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