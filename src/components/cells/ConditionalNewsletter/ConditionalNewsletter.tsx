"use client"

import { usePathname } from "next/navigation"
import NewsletterSection from "@/components/sections/NewsletterSection/NewsletterSection"

export const ConditionalNewsletter = () => {
  const pathname = usePathname()
  
  // Hide newsletter on user navigation pages and cart
  const hideNewsletter = pathname?.startsWith('/user') || pathname?.includes('/user/') || pathname?.startsWith('/cart') || pathname?.includes('/cart/')
  
  if (hideNewsletter) {
    return null
  }
  
  return <NewsletterSection />
}
