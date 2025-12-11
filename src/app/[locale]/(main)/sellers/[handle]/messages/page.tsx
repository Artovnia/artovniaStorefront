import { redirect, notFound } from "next/navigation"
import { Metadata } from "next"
import { getSellerByHandle } from "@/lib/data/seller"

// Define the expected params type structure for Next.js 15
type PageParams = {
  handle: string
  locale: string
}

type PageProps = {
  params: Promise<PageParams>
}

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  try {
    const { handle } = await props.params
    
    const seller = await getSellerByHandle(handle)

    if (!seller) {
      return {
        title: "Seller Not Found",
        description: "The seller you are looking for does not exist.",
      }
    }

    return {
      title: `Message ${seller.name}`,
      description: `Send a message to ${seller.name} on Artovnia.`,
    }
  } catch (error) {
    console.error('Error in messages generateMetadata:', error)
    return {
      title: "Message Seller",
      description: "Send a message to a seller on Artovnia.",
    }
  }
}

export default async function SellerMessagesPage(props: PageProps) {
  try {
    const { handle, locale } = await props.params
    
    // Messages tab has been removed - contact form is now in the sidebar
    // Redirect to main seller page where contact form is always visible
    redirect(`/${locale}/sellers/${handle}`)
  } catch (error) {
    console.error(`Error in SellerMessagesPage:`, error);
    return notFound();
  }
}