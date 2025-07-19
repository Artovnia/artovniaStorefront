import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import { retrieveCustomer } from "@/lib/data/customer"
import { getSellerByHandle } from "@/lib/data/seller"
import { notFound } from "next/navigation"
import { Metadata } from "next"

// Define the expected params type structure for Next.js 15.1.4
type PageParams = {
  handle: string
  locale: string
}

export async function generateMetadata(
  props: { params: PageParams }
): Promise<Metadata> {
  try {
    const { handle } = props.params
    
    const seller = await getSellerByHandle(handle)

    if (!seller) {
      return {
        title: "Seller Not Found | Artovnia",
        description: "The seller you are looking for does not exist.",
      }
    }

    return {
      title: `Message ${seller.name} | Artovnia`,
      description: `Send a message to ${seller.name} on Artovnia.`,
    }
  } catch (error) {
    console.error('Error in messages generateMetadata:', error)
    return {
      title: "Message Seller | Artovnia",
      description: "Send a message to a seller on Artovnia.",
    }
  }
}

export default function SellerMessagesPage(
  props: { params: PageParams }
) {
  const SellerMessageContent = async () => {
    try {
      const { handle, locale } = props.params
      
      // Check if handle is valid before proceeding
      if (!handle || handle === 'undefined') {
        console.error(`Invalid seller handle: ${handle} for messages page`);
        return notFound()
      }
      
      console.log(`Fetching seller with handle: ${handle} for messages page`);
      const seller = await getSellerByHandle(handle)

      if (!seller) {
        console.log(`Seller with handle ${handle} not found for messages page, showing 404 page`);
        return notFound()
      }

      const user = await retrieveCustomer()

      const tab = "messages"

      return (
        <main className="container">
          <SellerPageHeader seller={seller} user={user} />
          <SellerTabs
            tab={tab}
            seller_id={seller.id}
            seller_handle={seller.handle}
            seller_name={seller.name}
            locale={locale}
          />
        </main>
      )
    } catch (error) {
      console.error(`Error in SellerMessagesPage:`, error);
      return notFound();
    }
  }
  
  return <SellerMessageContent />
}