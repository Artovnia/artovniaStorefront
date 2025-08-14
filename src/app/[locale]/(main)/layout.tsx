import { Footer, Header } from '@/components/organisms';
import { LuxuryLoadingProvider, LuxuryLoadingOverlay } from '@/components/providers/LuxuryLoadingProvider';
import { CookieConsent } from '@/components/cells';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LuxuryLoadingProvider>
      <LuxuryLoadingOverlay />
      {/* Use flex column and min-h-screen to ensure footer is at bottom */}
      <div className="flex flex-col min-h-screen">
        <Header />
        {/* flex-grow-1 makes this element take all available space */}
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </div>
      {/* Cookie Consent Component */}
      <CookieConsent />
    </LuxuryLoadingProvider>
  );
}
