import { Footer, Header } from '@/components/organisms';
import { PageLoadingProvider, PageLoadingOverlay } from '@/components/providers/PageLoadingProvider';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageLoadingProvider>
      <PageLoadingOverlay />
      <Header />
      {children}
      <Footer />
    </PageLoadingProvider>
  );
}
