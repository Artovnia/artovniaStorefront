import { Footer, Header } from '@/components/organisms';
import { LuxuryLoadingProvider, LuxuryLoadingOverlay } from '@/components/providers/LuxuryLoadingProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LuxuryLoadingProvider>
      <LuxuryLoadingOverlay />
      <Header />
      {children}
      <Footer />
    </LuxuryLoadingProvider>
  );
}
