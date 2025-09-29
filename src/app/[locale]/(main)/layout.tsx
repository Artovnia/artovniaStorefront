import { Footer, Header } from '@/components/organisms';
import { CookieConsent } from '@/components/cells';
import { CartProvider } from '@/components/context/CartContext';
import { MobileUserNavigation } from '@/components/molecules';

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