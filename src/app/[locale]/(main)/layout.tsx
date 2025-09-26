import { Footer, Header } from '@/components/organisms';
import { CookieConsent } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { MobileUserNavigation } from '@/components/molecules';

// src/app/[locale]/(main)/layout.tsx
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // DON'T create cart in layout - causes cookie/revalidation errors
  console.log(' Layout: Skipping cart initialization (will be handled by CartContext)')
  const initialCart = null; // Always null - let CartContext handle it

  return (
    <CartProvider initialCart={initialCart}>
      <div className="flex flex-col min-h-screen ">
        <Header />
        <div className="flex-grow pb-20 md:pb-0">
          {children}
        </div>
        <Footer />
      </div>
      <MobileUserNavigation />
      <CookieConsent />
    </CartProvider>
  );
}