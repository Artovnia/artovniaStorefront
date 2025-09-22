import { Footer, Header } from '@/components/organisms';
import { LuxuryLoadingProvider, LuxuryLoadingOverlay } from '@/components/providers/LuxuryLoadingProvider';
import { CookieConsent } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { MobileUserNavigation } from '@/components/molecules';
import { retrieveCart } from '@/lib/data/cart';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get initial cart data for CartProvider
  const initialCart = await retrieveCart().catch(() => null) as any;

  return (
    <CartProvider initialCart={initialCart}>
   
        {/* Use flex column and min-h-screen to ensure footer is at bottom */}
        <div className="flex flex-col min-h-screen ">
          <Header />
          {/* flex-grow-1 makes this element take all available space */}
          <div className="flex-grow pb-20 md:pb-0">
            {children}
          </div>
          <Footer />
        </div>
        {/* Mobile User Navigation - Global */}
        <MobileUserNavigation />
        {/* Cookie Consent Component */}
        <CookieConsent />
   
    </CartProvider>
  );
}
