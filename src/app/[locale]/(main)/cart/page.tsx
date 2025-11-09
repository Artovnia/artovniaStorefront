import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Koszyk - Artovnia',
  description: 'Twój koszyk zakupowy',
};

// 🔒 CRITICAL: Disable caching for user cart
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CartPage({}) {
  return (
    <main className='container grid grid-cols-12'>
      <Cart />
    </main>
  );
}
