import { Footer, Header } from '@/components/organisms';
import { LoadingProvider, LoadingOverlay } from '@/components/providers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      <Header />
      {children}
      <Footer />
    </LoadingProvider>
  );
}
