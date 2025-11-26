import { Footer, Header } from '@/components/organisms';
import { ConditionalNewsletter } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
// ✅ OPTIMIZED: Lazy-loaded client components (Next.js 15 requires client wrapper for ssr: false)
import { CookieConsent, MobileUserNavigation } from '@/components/providers/ClientOnlyProviders';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 
  const initialCart = null; // Always null - let CartContext handle it

  return (
    <CartProvider initialCart={initialCart}>
      <div className="flex flex-col min-h-screen ">
        <Header />
        <div className="flex-grow pb-0">
          {children}
        </div>
        <ConditionalNewsletter />
        <Footer />
      </div>
      <MobileUserNavigation />
      <CookieConsent />
    </CartProvider>
  );
}