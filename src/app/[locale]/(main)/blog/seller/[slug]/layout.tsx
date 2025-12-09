/**
 * Seller Post Layout
 * 
 * NOTE: This layout is empty because seller posts are now under (main)/blog
 * The main layout provides Header, Footer, and CartProvider
 * Blog-specific layout is handled by BlogLayout component
 */
export default function SellerPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
